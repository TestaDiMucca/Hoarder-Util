import * as path from 'path';
import * as fs from 'fs/promises';
import * as isInvalid from 'is-invalid-path';
import { utils } from '@common/fileops';

import { FsOpFlags } from '../util/types';
import output from '../util/output';
import { getUserConfirmation, msgShortcuts, validatePath } from '../util/helpers';
import colors from '../util/colors';
import { checkPathExists } from '../util/files';

const dirTree = async (options: FsOpFlags) => {
    const dirListStr = options.commandArgs?.[0]?.split(',').filter((p) => !isInvalid(p));

    output.log('Will build from', dirListStr);

    if (dirListStr?.length === 0) return msgShortcuts.errorAndQuit('No valid dir paths provided');

    const absPath = await validatePath(options.path);

    if (!options.commit) {
        const created: string[] = [];
        const skipped: string[] = [];
        await walk(absPath, dirListStr, ({ exists, dirItem }) => {
            (exists ? skipped : created).push(dirItem);
        });

        output.out('Confirm actions below:');
        created.forEach((p) => output.out(colors.green('» Create:'), p));
        skipped.forEach((p) => output.out(colors.green('» Skip:'), p));
    }

    const input = getUserConfirmation('Commit changes?', options.commit);

    if (input === 'n') return msgShortcuts.messageAndQuit('Canceling on user request. Sayonara.');

    const created = await utils.withTimer(
        () =>
            walk(absPath, dirListStr, ({ exists, fullPath }) =>
                exists ? output.log(`Skipped creating ${fullPath} - existing`) : fs.mkdir(fullPath)
            ),
        (time) => output.log(`Created dirs in ${time} ms`)
    );

    output.out(`Created ${created.size} dirs`);
};

const walk = async (
    root: string,
    dirList: string[],
    cb: (c: { fullPath: string; dirItem: string; exists: boolean }) => void | Promise<void>
) => {
    const memMade = new Set<string>();
    for (const dirItem of dirList) {
        /* Deconstruct by directory chain to work way up to end */
        const pathToCreate = dirItem.split('/');
        let build = root;
        for (const sub of pathToCreate) {
            const fullPath = path.join(build, sub);
            build = fullPath;

            if (memMade.has(fullPath)) continue;

            const exists = await checkPathExists(fullPath);

            await cb({ exists, fullPath, dirItem: fullPath.replace(root, '') });

            memMade.add(fullPath);
        }
    }

    return memMade;
};

export default dirTree;
