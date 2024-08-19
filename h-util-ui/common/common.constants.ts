export enum IpcMessageType {
    /** Execute a pipeline on some loaded files */
    runPipeline = 'run-pipeline',
    /** Transfer a message from main to client */
    mainMessage = 'main-message',
    /** Transfer a message from the client to main */
    clientMessage = 'client-message',
    /** Load persisted user data */
    loadData = 'load-data',
    /** Persist saved user data */
    saveData = 'save-data',
    /** Let main update the client on task progress */
    taskProgress = 'task-progress',
    /** Event for window closing */
    close = 'close',
    /** Confirm we are ready to close */
    confirmClose = 'confirm-close',
    /** Get stored stats */
    getStats = 'get-stats',
    /** Call an electron dialog from the client to save file */
    saveFile = 'save-file',
    /** Open dialog to select a directory */
    selectDirectory = 'select-dir',
}
