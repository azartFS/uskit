use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum InstallStatus {
    Queued,
    Running,
    Success,
    Error,
}

#[derive(Clone, Serialize)]
pub struct StatusEvent {
    pub id: String,
    pub status: InstallStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub code: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

#[derive(Clone, Serialize)]
pub struct LogEvent {
    pub id: String,
    pub line: String,
    pub stream: LogStream,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum LogStream {
    Stdout,
    Stderr,
}

pub const EVT_STATUS: &str = "install:status";
pub const EVT_LOG: &str = "install:log";
