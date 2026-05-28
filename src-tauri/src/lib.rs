mod events;
mod installer;
mod winget;

use installer::{cancel_all, enqueue_install, init_state};
use winget::{check_winget, list_installed, open_ms_store_app_installer};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            init_state(&app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_winget,
            open_ms_store_app_installer,
            list_installed,
            enqueue_install,
            cancel_all
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
