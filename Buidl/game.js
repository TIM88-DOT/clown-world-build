async function getUserData(token) {
    const response = await fetch('/get-user-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    });

    if (response.ok) {
        return await response.json();
    } else {
        throw new Error('Unauthorized or invalid token');
    }
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    return { token };
}

async function sendParamsToUnity() {
    const unityInstance = UnityLoader.instantiate("unityContainer", "Build/Buidl.loader.js");
    const { token } = getQueryParams();
    
    try {
        const userData = await getUserData(token);
        unityInstance.SendMessage('GameManager', 'ReceiveUserData', JSON.stringify(userData));
    } catch (error) {
        console.error('Failed to fetch user data:', error);
    }
}

window.onload = sendParamsToUnity;
