import type { IAppModules, IAppRoles, ITimeConfig } from "./interfaces";
export const apihost: string = "https://us-central1-mahita-2c3b1.cloudfunctions.net/";
export const meetinghost: string = 'meetings.maahita.com';
export const appModules: IAppModules = {
    user: "user",
    presenter: "presenter",
    session: "session",
    notify: "notify",
    sessionrequest: "sessionrequest",
    upload: "upload"
};
export const session_remove = [
    "daypart",
    "year",
    "timepart",
];
export const appRoles: IAppRoles = {
    user: "user",
    presenter: "presenter",
    admin: "admin"
};
export const timeConfig: ITimeConfig = {
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
const getDateTimeParts = (dateString: string) => {
    const split = dateString.split(",");
    const splitdate = split[0].split(" ");
    const monthpart = splitdate[0];
    const daypart = splitdate[1];
    const year = split[1];
    const timepart = split[2];
    return { monthpart, daypart, year, timepart };
};
export const getFormattedDate = (data: any, field: string) => {
    const fieldData = data[field]; //expected to be a date
    const date = new Date(Date.parse(fieldData));
    return new Intl.DateTimeFormat("locale", timeConfig).format(date); // Jul 30, 2020, 04:30 PM
};
export const getDateParts = (data: any, field: string) => {
    const fieldData = data[field]; //expected to be a date
    const date = new Date(Date.parse(fieldData));
    const result = new Intl.DateTimeFormat("locale", timeConfig).format(date); // Jul 30, 2020, 04:30 PM
    const dateParts = getDateTimeParts(result);
    return { ...data, ...dateParts };
};
export const getBase64 = (file: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err: ProgressEvent<FileReader>) => reject('Error');
    reader.readAsDataURL(file);
});
export const removeUnusedFields = (data: Object, fields: string[]) => {
    let updated = {};
    Object.keys(data).forEach(key => {
        if (!fields.includes(key)) {
            updated[key] = data[key];
        }
    });
    return updated;
};
export const hasKey = (data: Object, key: string) => key in data;
export const getAuthHeaders = (data: string) => { return { headers: { authorization: data } }; };