import { useNavigate } from 'react-router-dom';
import { Line, Pie } from 'react-chartjs-2';
import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import '../styles/AnalyticsPage.css';
import * as AnalyticsConstants from '../features/analytics/Analytics.constants';
import { useAnalyticsPage } from '../features/analytics/AnalyticsController';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);



function Analytics() {
    const navigate = useNavigate();
    const analytics = useAnalyticsPage();

    return (
        <div id="analytics-page">
            <button className='back-button' onClick={() => navigate('/home')}>Back to Dashboard</button>
            <h1 className='analytics-header'>Analytics</h1>
            <div className='analytics-panels-container'>
                <div className='analytics-panel'>
                    <div className='analytics-panel-content'>
                        <h2>Task Details</h2>
                        <select
                            className='analytics-dropdown'
                            value={analytics.selectedMetric}
                            onChange={(event) => analytics.setSelectedMetric(event.target.value as AnalyticsConstants.AnalyticsMetric)}
                        >
                            {analytics.options.map((metric) => (
                                <option key={metric} value={metric}>
                                    {metric}
                                </option>
                            ))}
                        </select>
                        <div className='analytics-chart-container'>
                            {analytics.selectedMetric === 'Completed' ? (
                                <Pie data={analytics.pieChartData} options={analytics.pieChartOptions} />
                            ) : (
                                <Line data={analytics.chartData} options={analytics.lineChartOptions} />
                            )}
                        </div>
                    </div>
                </div>

                <div className='analytics-panel'>
                    <div className='analytics-panel-content'>
                        <h2>List Details</h2>
                        <select
                            className='analytics-dropdown'
                            value={analytics.selectedListMetric}
                            onChange={(event) => analytics.setSelectedListMetric(event.target.value as AnalyticsConstants.ListAnalyticsMetric)}
                        >
                            {analytics.listOptions.map((metric) => (
                                <option key={metric} value={metric}>
                                    {metric}
                                </option>
                            ))}
                        </select>
                        <div className='analytics-chart-container'>
                            <Line data={analytics.listChartData} options={analytics.lineChartOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;