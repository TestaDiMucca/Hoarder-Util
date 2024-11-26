export type ExifResult = {
    image: {
        Make: string;
        Model: string;
        Orientation: number;
        XResolution: number;
        YResolution: number;
        ResolutionUnit: number;
        Software: string;
        ModifyDate: string;
        YCbCrPositioning: number;
        Copyright: string;
        ExifOffset: number;
    };
    thumbnail: {
        Compression: 6;
        Orientation: 1;
        XResolution: number;
        YResolution: number;
        ResolutionUnit: 2;
        ThumbnailOffset: 1074;
        ThumbnailLength: 8691;
        YCbCrPositioning: 2;
    };
    exif: {
        FNumber: number;
        ExposureProgram: number;
        ISO: number;
        ExifVersion: Buffer;
        DateTimeOriginal: string;
        CreateDate: string;
        ComponentsConfiguration: Buffer;
        CompressedBitsPerPixel: number;
        ShutterSpeedValue: number;
        ApertureValue: number;
        BrightnessValue: 0.26;
        /** Other stuff */
        // ExposureCompensation: 0,
        // MaxApertureValue: 3,
        // MeteringMode: 5,
        // Flash: 1,
        // FocalLength: 8.7,
        // MakerNote: <Buffer 46 55 4a 49 46 49 4c 4d 0c 00 00 00 0f 00 00 00 07 00 04 00 00 00 30 31 33 30 00 10 02 00 08 00 00 00 c6 00 00 00 01 10 03 00 01 00 00 00 03 00 00 00 02 ...>,
        // ColorSpace: 1,
        // ExifImageWidth: 2400,
        // ExifImageHeight: 1800,
        // InteropOffset: 926,
        // FocalPlaneXResolution: 2381,
        // FocalPlaneYResolution: 2381,
        // FocalPlaneResolutionUnit: 3,
        // SensingMethod: 2,
        // FileSource: <Buffer 03>,
        // SceneType: <Buffer 01>
    };
    gps: {};
    interoperability: {
        InteropIndex: string;
        InteropVersion: Buffer;
    };
    makernote: {
        Version: Buffer;
        Quality: string;
        Sharpness: number;
        WhiteBalance: number;
        FujiFlashMode: number;
        FlashExposureComp: number;
        Macro: number;
        FocusMode: number;
        SlowSync: number;
        AutoBracketing: number;
        BlurWarning: number;
        FocusWarning: number;
        ExposureWarning: number;
    };
};
