use std::path::PathBuf;
use tauri_plugin_shell::ShellExt;

fn fallback_winget_path() -> Option<PathBuf> {
    let local_appdata = std::env::var("LOCALAPPDATA").ok()?;
    let p = PathBuf::from(local_appdata)
        .join("Microsoft")
        .join("WindowsApps")
        .join("winget.exe");
    if p.exists() {
        Some(p)
    } else {
        None
    }
}

pub async fn winget_executable(app: &tauri::AppHandle) -> Option<String> {
    // Try plain "winget" first — works if it's on PATH.
    if let Ok(out) = app
        .shell()
        .command("winget")
        .args(["--version"])
        .output()
        .await
    {
        if out.status.success() {
            return Some("winget".to_string());
        }
    }

    // Fall back to %LOCALAPPDATA%\Microsoft\WindowsApps\winget.exe
    fallback_winget_path().map(|p| p.to_string_lossy().into_owned())
}

#[tauri::command]
pub async fn check_winget(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let shell = app.shell();

    // Probe "winget" on PATH.
    if let Ok(out) = shell.command("winget").args(["--version"]).output().await {
        if out.status.success() {
            let v = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if !v.is_empty() {
                return Ok(Some(v));
            }
        }
    }

    // Fall back to absolute path.
    if let Some(exe) = fallback_winget_path() {
        if let Ok(out) = shell
            .command(exe.to_string_lossy().into_owned())
            .args(["--version"])
            .output()
            .await
        {
            if out.status.success() {
                let v = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if !v.is_empty() {
                    return Ok(Some(v));
                }
            }
        }
    }

    Ok(None)
}

#[tauri::command]
pub fn open_ms_store_app_installer(app: tauri::AppHandle) -> Result<(), String> {
    let shell = app.shell();
    shell
        .command("cmd")
        .args(["/C", "start", "", "ms-windows-store://pdp/?ProductId=9NBLGGH4NNS1"])
        .spawn()
        .map(|_| ())
        .map_err(|e| e.to_string())
}

/// Heuristic: does this whitespace-free token look like a winget PackageIdentifier?
/// e.g. `Google.Chrome`, `Git.Git`, `Microsoft.VisualStudioCode`, `7zip.7zip`.
/// We only use the result to test membership against our catalog, so a few
/// false positives (e.g. a name token) are harmless. We exclude pure version
/// strings like `120.0.6099` by requiring at least one ASCII letter.
fn looks_like_winget_id(tok: &str) -> bool {
    if tok.len() < 3 || !tok.contains('.') {
        return false;
    }
    if !tok.chars().any(|c| c.is_ascii_alphabetic()) {
        return false;
    }
    tok.chars()
        .all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '-' | '_' | '+'))
}

/// Parse `winget list` output, collecting everything that looks like a package Id.
/// This is the most complete view of installed software — it includes apps
/// installed outside winget that it can still map to an Id (Chrome, Git, ...),
/// which `winget export` frequently omits.
async fn list_installed_via_list(app: &tauri::AppHandle, exe: &str) -> Vec<String> {
    let mut ids = Vec::new();
    if let Ok(out) = app
        .shell()
        .command(exe.to_string())
        .args(["list", "--accept-source-agreements"])
        .output()
        .await
    {
        let text = String::from_utf8_lossy(&out.stdout);
        for line in text.lines() {
            for tok in line.split_whitespace() {
                if looks_like_winget_id(tok) {
                    ids.push(tok.to_string());
                }
            }
        }
    }
    ids
}

/// Parse `winget export` output as a secondary source.
async fn list_installed_via_export(app: &tauri::AppHandle, exe: &str) -> Vec<String> {
    let tmp_dir = std::env::temp_dir();
    let tmp_path = tmp_dir.join(format!("uskit-export-{}.json", std::process::id()));
    let tmp_str = tmp_path.to_string_lossy().into_owned();

    // winget export sometimes returns non-zero even when the file is written
    // (e.g. for packages without source). We ignore exit code and try to parse.
    let _ = app
        .shell()
        .command(exe.to_string())
        .args(["export", "-o", &tmp_str, "--accept-source-agreements"])
        .output()
        .await;

    let raw = match std::fs::read_to_string(&tmp_path) {
        Ok(s) => s,
        Err(_) => return Vec::new(),
    };
    let _ = std::fs::remove_file(&tmp_path);

    let json: serde_json::Value = match serde_json::from_str(&raw) {
        Ok(v) => v,
        Err(_) => return Vec::new(),
    };

    let mut ids = Vec::new();
    if let Some(sources) = json.get("Sources").and_then(|v| v.as_array()) {
        for src in sources {
            if let Some(packages) = src.get("Packages").and_then(|v| v.as_array()) {
                for p in packages {
                    if let Some(id) = p.get("PackageIdentifier").and_then(|v| v.as_str()) {
                        ids.push(id.to_string());
                    }
                }
            }
        }
    }
    ids
}

#[tauri::command]
pub async fn list_installed(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let exe = match winget_executable(&app).await {
        Some(p) => p,
        None => return Ok(Vec::new()),
    };

    // Merge both sources; `winget list` is primary, `export` fills any gaps.
    let mut seen: std::collections::HashSet<String> = std::collections::HashSet::new();
    for id in list_installed_via_list(&app, &exe).await {
        seen.insert(id);
    }
    for id in list_installed_via_export(&app, &exe).await {
        seen.insert(id);
    }

    Ok(seen.into_iter().collect())
}
