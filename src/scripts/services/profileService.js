'use strict';

import * as httpRequester from 'httpRequester';

import { appCredentials, baseServiceUrl, baseAppDataUrl } from 'appConstants';
import { dataValidator } from 'dataValidator';
import { storage } from 'storage';


const AUTH_TOKEN_KEY = 'x-auth-token',
    USER_ID_KEY = 'x-user-id',
    NAME_MIN_LENGTH = 3,
    NAME_MAX_LENGTH = 20;

function saveProfile(data) {
    if (!dataValidator.isValidName(data.firstname, NAME_MIN_LENGTH, NAME_MAX_LENGTH)) {
        return Promise.reject({
            message: 'Invalid first name'
        });
    }

    if (!dataValidator.isValidName(data.lastname, NAME_MIN_LENGTH, NAME_MAX_LENGTH)) {
        return Promise.reject({
            message: 'Invalid last name'
        });
    }

    let url = baseServiceUrl + '/appdata/' + appCredentials.appKey + '/profiles',
        headers = {
            'Authorization': 'Kinvey' + ' ' + storage.getItem(AUTH_TOKEN_KEY)
        };

    data.location = data.location || {};
    data = {
        avatarSrc: data.avatarSrc || '',
        firstname: data.firstname,
        lastname: data.lastname,
        gender: data.gender || 'Other',
        job: data.job || '',
        birthday: data.birthday || '',
        location: {
            city: data.location.city || '',
            country: data.location.country || ''
        },
        userId: storage.getItem(USER_ID_KEY),
        followings: data.followings || ['']
    };

    return new Promise((resolve, reject) => {
        httpRequester.postJSON(url, {
                headers: headers,
                data: data
            })
            .then((responseData) => {
                resolve(responseData);
            }, (error) => {
                reject(error);
            });
    });
}

function updateProfile(data, profileId) {
    if (!dataValidator.isValidName(data.firstname, NAME_MIN_LENGTH, NAME_MAX_LENGTH)) {
        return Promise.reject({
            message: 'Invalid first name'
        });
    }

    if (!dataValidator.isValidName(data.lastname, NAME_MIN_LENGTH, NAME_MAX_LENGTH)) {
        return Promise.reject({
            message: 'Invalid last name'
        });
    }

    let url = baseServiceUrl + '/appdata/' + appCredentials.appKey + '/profiles/' + profileId,
        headers = {
            'Authorization': 'Kinvey' + ' ' + storage.getItem(AUTH_TOKEN_KEY)
        };

    data.location = data.location || {};

    data = {
        avatarSrc: data.avatarSrc || '',
        firstname: data.firstname,
        lastname: data.lastname,
        job: data.job || '',
        birthday: data.birthday || '',
        location: {
            city: data.location.city || '',
            country: data.location.country || ''
        },
        userId: storage.getItem(USER_ID_KEY),
        followings: data.followings || ['']
    };

    return new Promise((resolve, reject) => {
        httpRequester.put(url, {
                contentType: 'application/json',
                headers: headers,
                data: data
            })
            .then((responseData) => {
                resolve(responseData);
            }, (error) => {
                reject(error);
            });
    });
}

function addFollowing(followerId, followingId) {
    return new Promise((resolve, reject) => {
        getByUserId(followerId)
            .then((userData) => {
                console.log(userData);
                if (userData[0].followings.indexOf(followingId) >= 0) {
                    return Promise.reject({ message: 'Already followed' });
                }

                userData[0].followings.push(followingId);
                return updateProfile(userData[0], userData[0]._id);
            })
            .then(() => {
                resolve({ message: 'Followed' });
            }, (error) => {
                reject(error);
            });
    });
}

function getByUserId(userId) {
    let queryParam = {
        userId: userId
    };

    return makeQuery(JSON.stringify(queryParam));
}

function getByName(name) {
    let nameTokens = name.split(' ');
    let queryString;
    if (nameTokens.length === 1) {
        queryString = '{"$or":[{"firstname":' + '"' + name + '"' + '}, { "lastname":' + '"' + name + '"' + '}]}';
    } else if (nameTokens.length === 2) {
        queryString = '{"$and":[{"firstname":' + '"' + nameTokens[0] + '"' + ', "lastname":' + '"' + nameTokens[1] + '"' + '}]}';
    } else {
        queryString = '{}';
    }

    return makeQuery(queryString);
}

function makeQuery(queryString) {

    let url = baseServiceUrl + '/appdata/' + appCredentials.appKey + '/profiles/?query=' + queryString;
    let headers = {
        'Authorization': 'Kinvey' + ' ' + storage.getItem(AUTH_TOKEN_KEY)
    };

    return new Promise((resolve, reject) => {
        httpRequester.getJSON(url, {
                headers: headers
            })
            .then((responseData) => {
                resolve(responseData);
            }, (error) => {
                reject(error);
            });
    });
}

export {
    saveProfile,
    updateProfile,
    getByName,
    getByUserId,
    addFollowing
};