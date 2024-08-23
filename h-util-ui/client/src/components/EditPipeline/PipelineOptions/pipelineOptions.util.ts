import debounce from 'lodash/debounce';
import { RenameTemplates } from '@shared/common.constants';

const stringTemplateExamples: Record<RenameTemplates, string> = {
    [RenameTemplates.DateCreated]: '04-12-07-01-00',
    [RenameTemplates.DateModified]: '09-01-12-13-00',
    [RenameTemplates.OriginalName]: 'IMG_0000',
    [RenameTemplates.SlugifiedName]: 'img_0000',
    [RenameTemplates.ParentFolder]: 'homework',
    [RenameTemplates.ExifTaken]: '04-12-07-00-00',
    [RenameTemplates.MetaAlbum]: '1/2 Coins Left',
    [RenameTemplates.MetaArtist]: 'Hirokit',
    [RenameTemplates.MetaTitle]: 'Clock Towers',
    [RenameTemplates.MetaTrackNo]: '2',
};

const validTags = Object.values(RenameTemplates);

export const previewRenamedFile = debounce(
    (stringTemplateRaw: string) => {
        const stringTemplate = stringTemplateRaw.length ? stringTemplateRaw : '%original%';
        let newName = String(stringTemplate);
        let usedMedia = false;
        let prevValue = newName;
        validTags.forEach((tag) => {
            newName = newName.replaceAll(`%${tag}%`, stringTemplateExamples[tag] ?? 'unknown');
            if (!usedMedia && prevValue !== newName && tag.includes('meta')) usedMedia = true;
            prevValue = newName;
        });

        const ext = usedMedia ? '.mp4' : '.png';

        return `${newName}${ext}`;
    },
    500,
    {
        trailing: true,
        leading: true,
    },
);
