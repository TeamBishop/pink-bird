'use strict';

import $ from 'jquery';

import { getByUserId } from 'profileService';
import * as httpRequester from 'httpRequester';
import { appCredentials, baseServiceUrl, baseAppDataUrl } from 'appConstants';


//const BASE_AUTH_CODE = 'Basic' + ' ' + getBase64Code(appCredentials.appKey + ':' + appCredentials.appSecret),
const AUTH_TOKEN_KEY = 'x-auth-token';
//    USER_ID = 'x-user-id';


function sendPost(userID, content) {
    let url = baseServiceUrl + baseAppDataUrl + appCredentials.appKey + '/feed-data',
        headers = {
            'Authorization': 'Kinvey ' + localStorage.getItem(AUTH_TOKEN_KEY),
        },
        postData = {
            user: userID,
            content: content
        };

    return new Promise((resolve, reject) => {
        getByUserId(userID)
            .then((user) => {     
                console.log(user);                  
                postData['user'] = user[0].firstname + ' ' + user[0].lastname;

                httpRequester
                .postJSON(url, {
                    headers: headers,
                    data: postData
                })
                .then((responseData) => {
                    resolve(responseData);
                },
                    (error) => {
                        reject(error);
                    });
            });
    });
}

function getAllPost(){
    let url = baseServiceUrl + '/appdata/' + appCredentials.appKey + '/feed-data/';
    let headers = {
        'Authorization':'Kinvey ' +  localStorage.getItem(AUTH_TOKEN_KEY)
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

export { sendPost, getAllPost };