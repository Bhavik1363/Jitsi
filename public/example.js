// import { JitsiMeetJS } from "lib-jitsi-meet";
// import $ from "jquery";
let options;
let roomName = 'merztest';
let token = 'eyJraWQiOiJ2cGFhcy1tYWdpYy1jb29raWUtODhkZmI3YTc0ODhmNDNhNjg5ZTM3ZDQzMmZlOTdhODUvZGQ1ZTYwLVNBTVBMRV9BUFAiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJqaXRzaSIsImV4cCI6MTYxNDQyNzA3MSwibmJmIjoxNjE0NDE5ODY2LCJpc3MiOiJjaGF0Iiwicm9vbSI6IioiLCJzdWIiOiJ2cGFhcy1tYWdpYy1jb29raWUtODhkZmI3YTc0ODhmNDNhNjg5ZTM3ZDQzMmZlOTdhODUiLCJjb250ZXh0Ijp7ImZlYXR1cmVzIjp7ImxpdmVzdHJlYW1pbmciOnRydWUsIm91dGJvdW5kLWNhbGwiOnRydWUsInRyYW5zY3JpcHRpb24iOnRydWUsInJlY29yZGluZyI6dHJ1ZX0sInVzZXIiOnsibW9kZXJhdG9yIjp0cnVlLCJuYW1lIjoiIiwiaWQiOiJhdXRoMHw2MDM3YjlkNmE0MjMyYTAwNjkxMWFlMzIiLCJhdmF0YXIiOiIiLCJlbWFpbCI6Im1vaGl0c2FpbmkxNzk1QGdtYWlsLmNvbSJ9fX0.AOZD1rKaLjaZxtF3RSpv7g8DmDfDQwdbElmmDVPhPJgq5Xvbhgf29dT9PluuyUzvvyxWga5UKerkFV4F5PThJ-pgY0Ifx9bga-5sB4iNYcpi7uTb2wLALfREot5UmbX_mpI1VaDRZmP17yLVrPMf1aL5oBnVW-Oiery0kUU-PYSa-yiFe0EigLYW-xWfTmbfV8ofXdw6c6NeKUGzrpaSjvCxXRxJrSo_VggOdR7zD-nvmJ0sQHeoMnZCU0eHZtybwkWlT3LxN3W6d8G2IQnqv49LcglhEWo4S9bI-0q5x19BgV3seeliSPJSUHrm8qX0uN6MmPf_Pw7nZfrG3ycfsA';
let tenant = 'vpaas-magic-cookie-88dfb7a7488f43a689e37d432fe97a85';

function buildOptions(roomName) {
    return {
        connection: {
            hosts: {
                domain: '8x8.vc',
                muc: `conference.${tenant}.8x8.vc`,
                focus: 'focus.8x8.vc'
            },
            serviceUrl: `wss://8x8.vc/xmpp-websocket?room=${roomName}`,
            clientNode: 'http://jitsi.org/jitsimeet'
        },
        conference: {
            p2p: {
                enabled: true
            }
        }
    };
}

let connection = null;
let isJoined = false;
let room = null;

let localTracks = [];
const remoteTracks = {};


function onLocalTracks(tracks) {
    localTracks = tracks;
    for (let i = 0; i < localTracks.length; i++) {
        if (localTracks[i].getType() === 'video') {
            $('body').append(`<video autoplay='1' class="video-left" id='localVideo${i}' />`);
            // $('body').append(`<video autoplay='1' id='localVideo${i} class='video-left' />`);
            localTracks[i].attach($(`#localVideo${i}`)[0]);
            localStorage.setItem('left-video', `localVideo${i}`)
        } else {
            $('body').append(
                `<audio autoplay='1' muted='true' id='localAudio${i}' />`);
            localTracks[i].attach($(`#localAudio${i}`)[0]);
        }
        if (isJoined) {
            room.addTrack(localTracks[i]);
        }
    }
}

function onRemoteTrack(track) {
    const participant = track.getParticipantId();

    if (!remoteTracks[participant]) {
        remoteTracks[participant] = [];
    }
    const idx = remoteTracks[participant].push(track);
    const id = participant + track.getType() + idx;
    
    if (track.getType() === 'video') {
        // $('body').append(
        //             `<video autoplay='1' id='${participant}video${idx}' />`);
        const remoteTrackLength = Object.keys(remoteTracks).length;
        if(remoteTrackLength % 2 === 1) {
            $('body').append(
                `<video autoplay='1' id='${participant}video${idx}' name='videoCenter' class='video-center' />`);
                localStorage.setItem('center-video', id);
        } 
        if(remoteTrackLength % 2 === 0) {
            $('body').append(
                `<video autoplay='1' id='${participant}video${idx}' name='videRight' class='video-right' />`);
                localStorage.setItem('right-video', id);
        } 
    } else {
        $('body').append(
            `<audio autoplay='1' id='${participant}audio${idx}' />`);
    }
    track.attach($(`#${id}`)[0]);
}


function onConferenceJoined() {
    console.log('conference joined!');
    isJoined = true;
    for (let i = 0; i < localTracks.length; i++) {
        room.addTrack(localTracks[i]);
    }
}


function onUserLeft(id) {
    console.log('user left');
    var el = document.getElementById(removepart+"video"+removeid);
        el.remove();
        console.log(el);
    if (!remoteTracks[id]) {
        return;
    }
    const tracks = remoteTracks[id];

    for (let i = 0; i < tracks.length; i++) {
        console.log('Element Id =>>' + id + ' ' + tracks[i].getParticipantId());
        // console.log("Element IDD ==>>"+tracks[i].getParticipantId()+"video"+1);
        tracks[i].detach($(`#${id}${tracks[i].getType()}`));
        var el = document.getElementById(tracks[i].getParticipantId()+"video"+"2");
        el.remove();
    }
}


function onConnectionSuccess() {
    room = connection.initJitsiConference(roomName, options.conference);
    room.on(
        JitsiMeetJS.events.conference.TRACK_ADDED,
        track => {
            !track.isLocal() && onRemoteTrack(track);
            console.log("tracked Add");
        });
    room.on(
        JitsiMeetJS.events.conference.CONFERENCE_JOINED,
        onConferenceJoined);
    room.on(
        JitsiMeetJS.events.conference.USER_JOINED,
        id => {
            console.log(`user joined: id`);
        });
    room.on(JitsiMeetJS.events.conference.USER_LEFT,onUserLeft);
    room.join();
    room.on
}


function onConnectionFailed(error) {
    console.error('Connection Failed!\n', error);
}


function disconnect() {
    console.log('disconnect!');
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
        onConnectionSuccess);
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_FAILED,
        onConnectionFailed);
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
        disconnect);
}


// Close all resources when closing the page.
function disconnect() {
    for (let i = 0; i < localTracks.length; i++) {
        localTracks[i].dispose();
        var el = document.getElementById(removepart+"video"+removeid);
        el.remove();
    }
    
    if (room) {
        room.leave();
    }
    if (connection) {
        connection.disconnect();
    }
}

$(window).bind('beforeunload', disconnect);
$(window).bind('unload', disconnect);

// $("#leaveButton").click(function(){
//     console.log("Leave button clicked");
//     var el = document.getElementById(removepart+"video"+removeid);
//     el.remove();
// });



$(document).ready(function() {
    JitsiMeetJS.init();

    $("#joinButton").click(function() {
        // const tenant = 'vpaas-magic-cookie-285d1d36bc7d4b2db21c3978b3451327';
        // roomName = 'merztest';
        options = buildOptions(roomName);
        // token = 'eyJraWQiOiJ2cGFhcy1tYWdpYy1jb29raWUtMjg1ZDFkMzZiYzdkNGIyZGIyMWMzOTc4YjM0NTEzMjcvMTA5MTRhLVNBTVBMRV9BUFAiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJqaXRzaSIsImV4cCI6MTYxNDQxNTM4OSwibmJmIjoxNjE0NDA4MTg0LCJpc3MiOiJjaGF0Iiwicm9vbSI6IioiLCJzdWIiOiJ2cGFhcy1tYWdpYy1jb29raWUtMjg1ZDFkMzZiYzdkNGIyZGIyMWMzOTc4YjM0NTEzMjciLCJjb250ZXh0Ijp7ImZlYXR1cmVzIjp7ImxpdmVzdHJlYW1pbmciOnRydWUsIm91dGJvdW5kLWNhbGwiOnRydWUsInRyYW5zY3JpcHRpb24iOnRydWUsInJlY29yZGluZyI6dHJ1ZX0sInVzZXIiOnsibW9kZXJhdG9yIjp0cnVlLCJuYW1lIjoiIiwiaWQiOiJnb29nbGUtb2F1dGgyfDEwODAyNDA1MDMxOTg3OTI1NTAwNCIsImF2YXRhciI6IiIsImVtYWlsIjoiaGFyejA5MDFAZ21haWwuY29tIn19fQ.hDTmW3dm5l8MYel_UmPjvPa69teZeVstaDrOiZdn92N9UlQ7zYXVeCmbrlRy0jX5H_9Xf-JgjUnnzJjooX8G2bzY566Y7YOBvKNgaqfM3X8bSEadSNmk6LMjFTGuIapgin_bRJxGhgBLcthbeYVfZ_xGo65-eKbNHDZrugJCzWFfty5l9yvZFsBm0-_KQ6jQZ8oISmRUY4J_Qowlz9BjBhbiLpAkw_gZGXlZnlEZEmkxDmTvqbzecEzQAdaf-PV0xrySa847RKc_hIrrQhttcfi9HGeZrwo05CcdYKKuZolnp6jIkof2bMIxt4YiNQL7CX9XN5vzZZG_yv_viuLC9w';

        connection = new JitsiMeetJS.JitsiConnection(null, token, options.connection);

        connection.addEventListener(
            JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
            onConnectionSuccess);
        connection.addEventListener(
            JitsiMeetJS.events.connection.CONNECTION_FAILED,
            onConnectionFailed);
        connection.addEventListener(
            JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
            disconnect);

        connection.connect();

        JitsiMeetJS.createLocalTracks({ devices: [ 'audio', 'video' ] })
            .then(onLocalTracks)
            .catch(error => {
                throw error;
            });
    });

    $("#leaveButton").click(function() {
        disconnect();
    })
    
});
