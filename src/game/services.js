const url = "https://d63ojp7jad.execute-api.eu-west-1.amazonaws.com/prod";
const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Basic ${localStorage.getItem("authCredentials")}`
});

// Not exported but necessary:
const getFaceParts = async (animalType) => {
    try {
        const response = await fetch(`${url}/facepart/face_parts_by_animal_type?animal_type=${animalType}`, {
            method: "GET",
            headers: getHeaders()
        });

        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage =
                    errorData.message ||
                    JSON.stringify(errorData) ||
                    response.statusText ||
                    `HTTP ${response.status}`;
            } catch {
                errorMessage = response.statusText || `HTTP ${response.status}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching information', error);
    }
};

export const getUserInfo = async (name) => {
    try {
        const response = await fetch(`${url}/user/users`, {
            method: "GET",
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch users (HTTP ${response.status})`);
        }
        const data = await response.json();
        const user = data.find(user => user.name === name);

        if (!user) {
            // pending UI:
            throw new Error(`User "${name}" not found (404)`);
        }

        const info = {
            type: user.user_type,
            id: user.id_user
        };
        return info;

    } catch (error) {
        console.error('Error fetching user id:', error);
        // pending UI:
        throw error;
    }
};

export const getFacePartId = async (part, animalType) => {
    const data = await getFaceParts(animalType)
    if (!data) {
        throw new Error("No face parts available");
    }
    const dataPart = data.find(el => el.animal_type === animalType && el.part_name === part);
    if (!dataPart) {
        throw new Error(`Face part "${part}" not found for animal type "${animalType}"`);
    }
    return dataPart.part_id;
};

export const sendRelamido = async (userId, partId) => {
    const response = await fetch(`${url}/user/lick`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
            id_user: userId,
            face_part_id: partId
        })
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage =
                errorData.message ||
                JSON.stringify(errorData) ||
                response.statusText ||
                `HTTP ${response.status}`;
        } catch {
            errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
    }

    return await response.json();
};

export const getUserScore = async (userId) => {
    try {
        const response = await fetch(`${url}/user/total_points?user_id=${userId}`, {
            method: "GET",
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch total points (HTTP ${response.status})`);
        }
        const data = await response.json();
        return data.total_points;

    } catch (error) {
        console.error('Error fetching user score:', error);
        throw error;
    }
};