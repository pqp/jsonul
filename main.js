const header = document.querySelector('header');
const section = document.querySelector('section');
const root = document.createElement('ul');

const requestURL = 'server.json';
let button = document.getElementById('darktoggle');

function updateButtonText()
{
    if (document.body.classList.contains("light")) {
        button.textContent = "Dark Mode";
    } else {
        button.textContent = "Light Mode";
    }
}

function toggleTheme()
{
    document.body.classList.toggle("light");
    document.body.classList.toggle("dark");

    updateButtonText();
}

function toggle(button)
{
    let theme = localStorage.getItem('theme')

    if (theme === "dark") {
        localStorage.setItem('theme', 'light');
    }
    if (theme === "light") {
        localStorage.setItem('theme', 'dark');
    }

    toggleTheme();
}

function buildRequest()
{
    let request = new XMLHttpRequest();

    // as soon as the request completes, print server data 
    request.onload = function() 
    {
        const serverData = request.response;
        printData(serverData);
    }

    request.onerror = function()
    {
        errorMsg("Couldn't request server.json from the server for some reason... ¯\_(ツ)_/¯");
    }

    request.ontimeout = function()
    {
        errorMsg("Looks like the server timed out before you could finish fetching server.json...");
    }

    return request;
}

function fetchJSON(url)
{
    // fetch the server JSON (which should be updated on the server every five seconds via systemd timer)
    let request = buildRequest();
    request.open('GET', url);
    request.timeout = 2000;
    request.responseType = 'json';
    request.send();

    return request;
}

function errorMsg(msg)
{
    root.textContent = msg;
}

function printChannel(channel, parentData, parentList)
{
    let users = channel['users'];
    let list = document.createElement('ul');
    let channels = channel['channels']

    list.textContent = channel['name'];

    // if the channel has other channels embedded, then parse those too
    if (channels) {
        for (let i = 0; i < channels.length; i++) {
            printChannel(channels[i], channel, list);
        }
    }

    if (users) {
        // iterate through each user in the channel and build a list item element from it
        for (let i = 0; i < users.length; i++) {
            let user = users[i];
            let userName = users[i]['name'];
            let userItem = document.createElement('li');

            userItem.textContent = userName;
            // write the list item to the DOM
            list.appendChild(userItem);
        }
    }

    if (parentList) {
        parentList.appendChild(list);
        return;
    } else {
        return list;
    }
}

function printData(json) 
{
    if (!json) {
        errorMsg("JSON data is null...server.json is probably absent from the server. Give it a few seconds to refresh.");
        return;
    }

    let channels = json['root']['channels']; 
    root.textContent = json['name'];
    // iterate through each channel and build an unordered list from it
    for (let i = 0; i < channels.length; i++) {
        let channel = printChannel(channels[i], null, null);

        // write the channel name and its list data
        root.appendChild(channel);
    }

    section.appendChild(root);
}

function refresh()
{
    root.innerHTML = "<p>Reloading...</p>";

    let request = fetchJSON(requestURL);

    setTimeout(refresh, 5000);
}

let theme = localStorage.getItem('theme')

if (!theme) {
    localStorage.setItem('theme', "dark");
} else {
    if (theme === "light") {
        toggleTheme();
    }
    updateButtonText();
}

let request = fetchJSON(requestURL);

setTimeout(refresh, 5000);