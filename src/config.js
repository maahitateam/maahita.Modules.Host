export const apihost = "https://us-central1-mahita-2c3b1.cloudfunctions.net/";

export const meetinghost = 'meetings.maahita.com';

export const appModules = {
    "user": "user",
    "presenter": "presenter",
    "session": "session",
    "notify": "notify",
    "sessionrequest": "sessionrequest",
    "upload": "upload"
};

export const session_remove = [
    "daypart",
    "year",
    "timepart",
];

export const appRoles = {
    "user": "user",
    "presenter": "presenter",
    "admin": "admin"
};
export const timeConfig = {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    month: "short",
    hour12: true,
    year: "numeric",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
};
// dateString: Jul 30, 2020, 04:30 PM
// returns {monthpart: 'Jul', daypart:30, year:2020, timepart:04:30 PM}
const getDateTimeParts = (dateString) => {
    const split = dateString.split(",");
    const splitdate = split[0].split(" ");
    const monthpart = splitdate[0];
    const daypart = splitdate[1];
    const year = split[1];
    const timepart = split[2];
    return { monthpart, daypart, year, timepart };
};

export const getFormattedDate = (data, field) => {
    const fieldData = data[field]; //expected to be a date
    const date = new Date(Date.parse(fieldData));
    return new Intl.DateTimeFormat("locale", timeConfig).format(date); // Jul 30, 2020, 04:30 PM
};

export const getDateParts = (data, field) => {
    const fieldData = data[field]; //expected to be a date
    const date = new Date(Date.parse(fieldData));
    const result = new Intl.DateTimeFormat("locale", timeConfig).format(date); // Jul 30, 2020, 04:30 PM
    const dateParts = getDateTimeParts(result);
    return { ...data, ...dateParts };
};

export const getBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject('Error', err);
    reader.readAsDataURL(file);
});

export const removeUnusedFields = (data, fields) => {
    const updated = {};
    Object.keys(data).forEach(key => {
        if (!fields.includes(key)) {
            updated[key] = data[key];
        }
    });
    return updated;
};

export const hasKey = (data, key) => data.hasOwnProperty(key);

export const getAuthHeaders = (data) => { return { headers: { authorization: data } }; };

export const jitsiConfig = (meetingid, domain) => {
    return {
        domain: `${domain}/${meetingid}`,
        options: {
            parentNode: document.querySelector("#meeting > #dialog-body"),
            userInfo: {
                email: '',
                displayName: '',
            },
            configOverwrite: {
                startWithAudioMuted: true,
                enableNoAudioDetection: true,
                enableNoisyMicDetection: true,
                resolution: 1080,
                startWithVideoMuted: true,
                liveStreamingEnabled: true,
                videoQuality: {
                    maxBitratesVideo: {
                        standard: 500000,
                        high: 1500000,
                    },
                },
                enableWelcomePage: true,
            },
            interfaceConfigOverwrite: { filmStripOnly: true },
        }
    };
};
// domain - `meetings.maahita.com/${meetingid}`
export const getExternalJitsiApi = (meetingid, domain, appUser) => {
    const config = jitsiConfig(meetingid, domain);
    config.options.userInfo = {
        email: appUser.email,
        displayName: appUser.displayName,
    };
    return new JitsiMeetExternalAPI(config.domain, config.options);
};
