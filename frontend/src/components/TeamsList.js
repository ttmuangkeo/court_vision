import React, {useEffect, useState} from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';


function TeamsList() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_BASE}/teams`)
        .then(res => {
            setTeams(res.data.data);
            setLoading(false);
        })
        .catch(err => {
            console.error('Error fetching teams:', err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div>Loading teams...</div>;

    return (
        <div>
            <h2>NBA Teams</h2>
            <ul>
                {teams.map(team => (
                    <li key={team.id}>
                        <strong>{team.name}</strong> ({team.abbreviation}) - {team.city}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TeamsList;