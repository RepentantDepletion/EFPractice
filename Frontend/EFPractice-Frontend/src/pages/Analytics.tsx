import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Analytics.css';

function Analytics() {
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    return (
        <div className="analytics-page">
            <button className='back-button' onClick={() => navigate('/')}>Back to Dashboard</button>
            <h1 className='analytics-header'>Analytics</h1>
            <select className='analytics-dropdown'>
                <option value="default">Default</option>
                <option value="sales">Sales</option>
                <option value="users">Users</option>
            </select>
        </div>
    );
}

export default Analytics;