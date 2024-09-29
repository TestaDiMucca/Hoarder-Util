import { SpawnedTask } from '@shared/common.types';
import { getIpcRenderer } from '@utils/helpers';
import throttle from 'lodash/throttle';

class TaskListener {
    tasks: Record<number, SpawnedTask> = {};
    initiated = false;

    private handleTaskProgress = throttle(
        (stringified) => {
            const updatedTask = JSON.parse(stringified) as SpawnedTask;
            this.tasks[updatedTask.id] = Object.assign(this.tasks[updatedTask.id] ?? {}, updatedTask);
        },
        200,
        {
            leading: true,
            trailing: true,
        },
    );

    public init = () => {
        if (this.initiated) return;

        getIpcRenderer().onTaskProgress(this.handleTaskProgress);
        this.initiated = true;
    };
}

export default new TaskListener();
