export type {
    ProcessingModule,
    ActionModule,
    BranchingModule,
    Pipeline,
    TaskQueue,
    SpawnedTask,
} from '../../../common/common.types';

export { ProcessingModuleType } from '../../../common/common.types';

export enum PageViews {
    Home = '/',
    Edit = '/new',
    Directories = '/directories',
    Internals = '/internals',
}
