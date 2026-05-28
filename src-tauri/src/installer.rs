use crate::events::{InstallStatus, LogEvent, LogStream, StatusEvent, EVT_LOG, EVT_STATUS};
use crate::winget::winget_executable;
use serde::Deserialize;
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_shell::{process::CommandEvent, ShellExt};
use tokio::sync::mpsc::{unbounded_channel, UnboundedSender};

#[derive(Debug, Clone, Deserialize)]
pub struct InstallJob {
    pub id: String,
    pub winget_id: String,
    #[serde(default)]
    pub auto_install: bool,
    #[serde(default)]
    pub download_dir: Option<String>,
}

pub struct InstallerState {
    tx: UnboundedSender<InstallJob>,
}

impl InstallerState {
    pub fn new(tx: UnboundedSender<InstallJob>) -> Self {
        Self { tx }
    }
}

pub fn spawn_worker(app: AppHandle) -> UnboundedSender<InstallJob> {
    let (tx, mut rx) = unbounded_channel::<InstallJob>();

    let app_handle = app.clone();
    tauri::async_runtime::spawn(async move {
        while let Some(job) = rx.recv().await {
            run_one(&app_handle, job).await;
        }
    });

    tx
}

async fn run_one(app: &AppHandle, job: InstallJob) {
    let _ = app.emit(
        EVT_STATUS,
        StatusEvent {
            id: job.id.clone(),
            status: InstallStatus::Running,
            code: None,
            message: None,
        },
    );

    let mut args: Vec<String> = Vec::new();
    if job.auto_install {
        args.push("install".into());
    } else {
        args.push("download".into());
    }
    args.push("--id".into());
    args.push(job.winget_id.clone());
    args.push("-e".into());
    args.push("--accept-source-agreements".into());
    args.push("--accept-package-agreements".into());

    if job.auto_install {
        args.push("--silent".into());
    } else if let Some(dir) = job.download_dir.as_ref().filter(|s| !s.is_empty()) {
        args.push("-d".into());
        args.push(dir.clone());
    }

    let exe = match winget_executable(app).await {
        Some(p) => p,
        None => {
            let _ = app.emit(
                EVT_STATUS,
                StatusEvent {
                    id: job.id.clone(),
                    status: InstallStatus::Error,
                    code: None,
                    message: Some("winget not found".into()),
                },
            );
            return;
        }
    };

    let spawn_result = app
        .shell()
        .command(exe)
        .args(args.iter().map(|s| s.as_str()))
        .spawn();

    let (mut rx_evt, _child) = match spawn_result {
        Ok(pair) => pair,
        Err(e) => {
            let _ = app.emit(
                EVT_STATUS,
                StatusEvent {
                    id: job.id.clone(),
                    status: InstallStatus::Error,
                    code: None,
                    message: Some(format!("failed to spawn winget: {e}")),
                },
            );
            return;
        }
    };

    let mut exit_code: Option<i32> = None;
    let mut error_msg: Option<String> = None;

    while let Some(event) = rx_evt.recv().await {
        match event {
            CommandEvent::Stdout(bytes) => {
                let line = String::from_utf8_lossy(&bytes).trim_end().to_string();
                if !line.is_empty() {
                    let _ = app.emit(
                        EVT_LOG,
                        LogEvent {
                            id: job.id.clone(),
                            line,
                            stream: LogStream::Stdout,
                        },
                    );
                }
            }
            CommandEvent::Stderr(bytes) => {
                let line = String::from_utf8_lossy(&bytes).trim_end().to_string();
                if !line.is_empty() {
                    let _ = app.emit(
                        EVT_LOG,
                        LogEvent {
                            id: job.id.clone(),
                            line,
                            stream: LogStream::Stderr,
                        },
                    );
                }
            }
            CommandEvent::Error(err) => {
                error_msg = Some(err);
            }
            CommandEvent::Terminated(payload) => {
                exit_code = payload.code;
                break;
            }
            _ => {}
        }
    }

    let success = exit_code == Some(0);
    let _ = app.emit(
        EVT_STATUS,
        StatusEvent {
            id: job.id,
            status: if success {
                InstallStatus::Success
            } else {
                InstallStatus::Error
            },
            code: exit_code,
            message: error_msg,
        },
    );
}

#[tauri::command]
pub async fn enqueue_install(
    app: AppHandle,
    state: State<'_, InstallerState>,
    job: InstallJob,
) -> Result<(), String> {
    let _ = app.emit(
        EVT_STATUS,
        StatusEvent {
            id: job.id.clone(),
            status: InstallStatus::Queued,
            code: None,
            message: None,
        },
    );
    state.tx.send(job).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn cancel_all(_app: AppHandle, _state: State<'_, InstallerState>) -> Result<(), String> {
    // MVP: no preemptive cancel — winget jobs run to completion. Stub kept for future.
    Ok(())
}

pub fn init_state(app: &AppHandle) {
    let tx = spawn_worker(app.clone());
    app.manage(InstallerState::new(tx));
}
