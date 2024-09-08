import debounce from 'lodash/debounce';
import { RenameTemplates } from '@shared/common.constants';
import { formatDateString } from '@shared/common.utils';

const sampleDates: Record<string, Date> = {
    [RenameTemplates.DateCreated]: new Date('2007-12-04'),
    [RenameTemplates.DateModified]: new Date('2009-01-09'),
    [RenameTemplates.ExifTaken]: new Date('2009-12-11'),
};

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

const isDateTag = (tag: RenameTemplates) => !!sampleDates[tag];

const validTags = Object.values(RenameTemplates);
const validDateTags = validTags.filter((t) => isDateTag(t));

export const hasDateTag = (stringTemplate: string) => validDateTags.some((tag) => stringTemplate.includes(`%${tag}%`));

export const previewRenamedFile = debounce(
    (stringTemplateRaw: string, dateMask?: string) => {
        const stringTemplate = stringTemplateRaw.length ? stringTemplateRaw : '%original%';
        let newName = String(stringTemplate);
        let usedMedia = false;
        let prevValue = newName;
        validTags.forEach((tag) => {
            const replacementString = isDateTag(tag)
                ? formatDateString(sampleDates[tag], dateMask)
                : stringTemplateExamples[tag];
            newName = newName.replaceAll(`%${tag}%`, replacementString ?? 'unknown');
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
