import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
	Alert,
} from '@vkontakte/vkui';

export const getKeyByValue = (obj, value) => {
    return Object.keys(obj).find(val => obj[val] === value)
}
export const enumerate = (num, dec) => {
    if (num > 100) num = num % 100;
    if (num <= 20 && num >= 10) return dec[2];
    if (num > 20) num = num % 10;
    return num === 1 ? dec[0] : num > 1 && num < 5 ? dec[1] : dec[2];
}
export const recog_number = (num) => {
    let out = ""
    if (num > 999999) {
        out = Math.floor(num / 1000000 * 10) / 10 + "M"
    } else if (num > 999) {
        out = Math.floor(num / 1000 * 10) / 10 + "K"
    } else {
        out = num
    }
    return out;
};
export const getHumanyTime = (unixtime) => {
    let date, time, year, month, day, hours, minutes, datetime;
    if (unixtime !== null) {
        unixtime = unixtime * 1e3;
        let dateObject = new Date(unixtime);
        month = monthsConvert(dateObject.getMonth())
        year = dateObject.getFullYear()
        day = dateObject.getDate()
        date = day + " " + month + " " + year;
        hours = normalizeTime(dateObject.getHours())
        minutes = normalizeTime(dateObject.getMinutes())
        time = hours + ":" + minutes;
        datetime = date + " " + time
    }
    return ({ date, time, year, month, day, hours, minutes, datetime })
}

export const normalizeTime = (time) => {
    if (time < 10) {
        return "0" + time
    } else {
        return time
    }
}
export const monthsConvert = (text) => {
    let mounts = [
        "января",
        "февраля",
        "марта",
        "апреля",
        "мая",
        "июня",
        "июля",
        "августа",
        "сентября",
        "октября",
        "ноября",
        "декабря"
    ];
    return mounts[text]
}

export const errorAlertCreator = (setPopout, error = null, action = null) => {
    setPopout(
        <Alert
            actionsLayout="horizontal"
            actions={[{
                title: 'Отмена',
                autoclose: true,
                mode: 'cancel',
                action: action,
            }]}
            onClose={() => setPopout(null)}
            header="Ошибка"
            text={error ? `${error}` : "Что-то пошло не так, попробуйте снова!"}
        />
    )
}

export const prepareQueryString = (q) => {
    let user_string = q;
    if(isNaN(user_string)){
        if(/vk\.com\/.+/.test(user_string)){
            //На самом деле точка после \w нужна
            // eslint-disable-next-line
            user_string = user_string.match(/(?<=vk\.com\/)[\w\.]+/ui)[0];
        }
    }
    return user_string;
}

export const resolveScreenName = async (q, token) => {
    if(!isNaN(q)) return q; 
    let data = await bridge.send("VKWebAppCallAPIMethod", {
        method: 'utils.resolveScreenName',
        params: {
            screen_name: q,
            v: "5.131", 
            access_token: token,
        }
    })
    let user;
    if(data.response.type !== 'user') return '';
    user = data.response.object_id;
    return user;
}

export const getIdByLink = async (link, token) => {
    let new_link = prepareQueryString(link);
    let id = await resolveScreenName(new_link, token);
    return id
}