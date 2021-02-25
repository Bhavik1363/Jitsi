// import { JitsiMeetJS } from "lib-jitsi-meet";
// import $ from "jquery";
let options;
let roomName;
let token;

function buildOptions(roomName) {
    return {
        connection: {
            hosts: {
                domain: 'aepc-unite.melzo.com',
                muc: `conference.aepc-unite.melzo.com`,
                focus: 'focus.aepc-unite.melzo.com'
            },
            serviceUrl: `wss://aepc-unite.melzo.com/xmpp-websocket?room=${roomName}`,
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
            $('body').append(`<video autoplay='1' id='localVideo${i}' />`);
            localTracks[i].attach($(`#localVideo${i}`)[0]);
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
        $('body').append(
            `<video autoplay='1' id='${participant}video${idx}' />`);
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

    $("#goButton").click(function() {
        const tenant = $("#tenantInput").val();
        roomName = $("#roomInput").val();
        options = buildOptions(roomName);
        token = $("#tokenInput").val();

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
    
});
