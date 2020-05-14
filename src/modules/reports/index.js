import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Header, Content } from 'components/layout';
import { Formik } from 'formik';
import { Form, Select } from 'formik-antd';
import { Row, Col, DatePicker, Button, Radio } from 'antd';
import * as moment from 'moment';

import ReportAPI from 'api/report';

const { RangePicker } = DatePicker;

function Reports(props) {    
    //const [dates, setDates] = useState([null, null]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [reportDuration, setReportDuration] = useState('last24');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const setCustomDates = (dates) => {
        console.log('start and end dates', dates);
        setStartDate(dates[0]);
        setEndDate(dates[1]);
    }

    const onReportDurationChange = (event) => {
        const value = event.target.value;
        if(value == 'custom') {
            setShowCalendar(true);
        }
        else {
            setShowCalendar(false);
        }
        setReportDuration(value);
    }    

    const download = (formProps) => {
        console.log('form props', formProps);
        let startDt = null;
        let endDt = null;
        
        switch(reportDuration) {
            case 'last24':
                startDt = moment();
                endDt = moment().add(-1, 'd');
                break;
            case 'last48':
                startDt = moment();
                endDt = moment().add(-2, 'd');
                break;
            case 'today':
                startDt = moment().startOf('day');
                endDt = moment();
                break;
            case 'custom':
                startDt = startDate.startOf('day');
                endDt = endDate.endOf('day');
                break;
        }

        console.log('start date', startDt);
        console.log('end date', endDt);

        const req = ReportAPI.post({reportName: formProps.reporttype, jurisdiction: formProps.jurisdiction, startDate: startDt, endDate: endDt});
        req.then(resp => {
            const filename = resp.headers['filename'];
            const blob = new Blob([resp.text], { type: 'txt/csv' });
            let url = window.URL.createObjectURL(blob);
            let link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        err => {
            console.log(err);
        })
    }

    const setDateRange = () => {

    }

    return (
    <>
        <Header>Reports</Header>
        <Content style={{ padding: 10 }}>
            <h1>Generate New Report</h1>
            <Formik initialValues={{reporttype: '', jurisdiction: '', reportduration: '', date: []}}
                 onSubmit={ formProps => download(formProps) }>
                <Form layout='vertical'>
                    <Row>
                        <Col span={8}>                    
                            <Form.Item name='reporttype' label='SELECT REPORT TYPE'>
                                <Select showSearch name='reporttype' placeholder='Report Type'>
                                    <Select.Option value='SUM_ISOLATION_TOTAL_PATIENT'>Sum Isolation Total Patients Hospital Wise</Select.Option>
                                    <Select.Option value='Positive Patients Line List'>Positive Patients Line List</Select.Option>
                                    <Select.Option value='DAILY_PATIENT_DISCHARGE_LIST'>Daily Patient Discharge List</Select.Option>
                                    <Select.Option value='DAILY_PATIENT_DEATH_LIST'>Daily Patient Death List</Select.Option>
                                    <Select.Option value='COVID Facilities Details'>COVID Facilities Details</Select.Option>
                                    <Select.Option value='COVID Facilities Summary'>COVID Facilities Summary</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8} offset={2}>
                            <Form.Item name="jurisdiction" label='SELECT JURISDICTION'>
                                <Select name="jurisdiction" placeholder="Jurisdiction">
                                    <Select.Option value='pmc'>PMC</Select.Option>
                                    <Select.Option value='pcmc'>PCMC</Select.Option>
                                    <Select.Option value='dho'>DHO</Select.Option>
                                    <Select.Option value='cs'>CS</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item name="reportduration" label="SELECT REPORT DATE RANGE">
                                <Radio.Group name="reportduration" buttonStyle="solid" 
                                    defaultValue="last24" onChange={(event) => onReportDurationChange(event)}>
                                    <Radio.Button value='last24'>Last 24 Hours</Radio.Button>
                                    <Radio.Button value='last48'>Last 48 Hours</Radio.Button>
                                    <Radio.Button value='today'>Today</Radio.Button>
                                    <Radio.Button value='progressive'>Progressive</Radio.Button>
                                    <Radio.Button value='custom'>Custom</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                    {
                        showCalendar && (
                            <Row>
                                <Col span={24}>
                                    <Form.Item name="customDates" label="SELECT CUSTOM DATE RANGE">
                                        <RangePicker name='customDates' onCalendarChange={value => setCustomDates(value)}></RangePicker>
                                    </Form.Item>
                                </Col>
                            </Row>
                        )
                    }
                    <Row>
                        <Col>
                            <Button htmlType='submit'>DOWNLOAD</Button>
                        </Col>
                    </Row>
                </Form>                
            </Formik>
        </Content>        
    </>);
}

function mapStateToProps(state) {
    return {};
}

export default connect(mapStateToProps, { })(Reports);