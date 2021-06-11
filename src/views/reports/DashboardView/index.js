/* eslint-disable */
import React, { useState } from 'react';
import {
  Container,
  Grid,
  makeStyles,
  createStyles,
  withStyles
} from '@material-ui/core';
import Page from 'src/components/Page';
import Budget from './Budget';
import LatestOrders from './LatestOrders';
import LatestProducts from './LatestProducts';
import Sales from './Sales';
import TasksProgress from './TasksProgress';
import TotalCustomers from './TotalCustomers';
import TotalProfit from './TotalProfit';
import TrafficByDevice from './TrafficByDevice';
import Balance from './Balance';
import Food from './Food';
import Rooms from './Rooms';
import Vendor from './Vendor';
import {makeRequest, handleError} from 'src/utils/axios-helper'
import { connect } from 'react-redux';

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

class Dashboard extends React.Component{

  constructor(props){
    super(props)
    this.state = {
      data: {
        active_investment:"----",
        total_interest:"----",
        customers:"----",
      }
    }
  }

  componentDidMount(){
    makeRequest(this.props).get('/dashboard')
    .then(response => {
      this.setState({data: response.data.data})
    })
    .catch(error => {
        handleError({
            error: error,
            callbacks: {
              400: response=>{
               //Do nothing
              },
              401: response=>{
                 //Do nothing
              },
              403: response=>{
                 //Do nothing
              },
              500: response=>{
                 //Do nothing
              },
            }
        }, this.props);
    })
    .finally(() => {
        //Do nothing
    })
  }

  render(){
    return (
      <Page
        className={this.props.classes.root}
        title="Dashboard"
      >
        <Container maxWidth={false}>
          <Grid
            container
            spacing={2}
          >

            <Grid
              item
              lg={4}
              sm={6}
              xl={4}
              xs={12}
            >
              <TotalCustomers data={this.state.data.customers} />
            </Grid>

            <Grid
              item
              lg={4}
              sm={6}
              xl={4}
              xs={12}
            >
              <Budget data={this.state.data.total_interest} />
            </Grid>

            <Grid
              item
              lg={4}
              sm={6}
              xl={4}
              xs={12}
            >
              <Rooms data={this.state.data.active_investment} />
            </Grid>
          </Grid>
        </Container>
      </Page>
    );
  }
};

const mapStateToProps = state =>({
  session_token: state.session_token
})

export default connect(mapStateToProps)(
  withStyles(useStyles)(Dashboard));
