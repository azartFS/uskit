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

#[tauri::command]
pub async fn list_installed(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let exe = match winget_executable(&app).await {
        Some(p) => p,
        None => return Ok(Vec::new()),
    };

    let tmp_dir = std::env::temp_dir();
    let tmp_path = tmp_dir.join(format!("uskit-export-{}.json", std::process::id()));
    let tmp_str = tmp_path.to_string_lossy().into_owned();

    let result = app
        .shell()
        .command(exe)
        .args([
            "export",
            "-o",
            &tmp_str,
            "--accept-source-agreements",
        ])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    // winget export sometimes returns non-zero even when the file is written
    // (e.g. for packages without source). We ignore exit code and try to parse.
    let _ = result;

    let raw = match std::fs::read_to_string(&tmp_path) {
        Ok(s) => s,
        Err(e) => return Err(format!("read export: {e}")),
    };
    let _ = std::fs::remove_file(&tmp_path);

    let json: serde_json::Value =
        serde_json::from_str(&raw).map_err(|e| format!("parse export: {e}"))?;

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

    Ok(ids)
}
