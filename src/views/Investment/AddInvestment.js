/* eslint-disable */
import React from 'react';
import {
    Avatar,
    Box, 
    Button, 
    Card, 
    CardActions, 
    CardContent, 
    CardHeader, 
    Container,
    createStyles, 
    Divider, 
    TextField, 
    withStyles,
    AppBar,
    Typography,
    IconButton,
    Grid,
    TableRow,
    TableCell,
    MenuItem,
    CircularProgress,
    FormControlLabel,
    Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import Toolbar from './Toolbar';
import { connect } from 'react-redux'
import {withSnackbar} from 'notistack'
import { setUser } from 'src/actions'
import withConfirmationDialog from 'src/utils/confirmationDialog'
import { uniqueId } from 'lodash';
import {makeRequest, handleError} from 'src/utils/axios-helper';
import { withPermission, useRouter } from 'src/utils';
import qs from 'qs'
import { Add, Remove } from '@material-ui/icons';
import moment from 'moment';

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  productCard: {
    height: '100%'
  }
}));

const VIEW_PERMISSION_NAME = [];

class AddInvestment extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            customer: null,
            customer_name: null,
            amount: null,
            rate: null,
            frequency: 'monthly',
            frequency_roi: 0,
            total_interest: null,
            total_amount: null,
            duration: null,
            investment_date: null,
            maturity_date: null,
            text: "",
            send_alert: true,
            customers: [],
            isLoading: false,
        }
    }

    componentDidMount(){
        //check if token is valid
        makeRequest(this.props).post('/customer/list/all')
            .then(response => {
                this.setState({customers: response.data.data.list});
            })
            .catch(error => {
                handleError({
                    error: error,
                    callbacks: {
                        400: response=>{
                            this.props.enqueueSnackbar(response.data.message, {variant: "error"});
                        }
                    }
                }, this.props);
            })
            .finally(() => {
                //do nothing
                this.setState({isLoading:false});
            })
    }

    handleCreate = (event) =>{
        this.props.openDialog({
            viewCtrl: "warning",
            title: "Confirm New Investment",
            description: "Make sure you have confirmed the details before you proceed from here",
            close: dialog =>{
                if(dialog.viewCtrl == "success"){
                    this.props.navigate("/app/investments");
                }
                dialog.close()
            },
            confirm: dialog =>{
                makeRequest(this.props).post('/investment/add', qs.stringify(this.state))
                    .then(response => {
                        dialog.setViewCtrl("success")
                        dialog.setTitle("Investment Record Created!")
                        dialog.setDescription(
                            <Typography>
                                {response.data.message}
                            </Typography>
                        )
                        this.props.enqueueSnackbar(response.data.message, {variant: "success"}); 
                    })
                    .catch(error => {
                        handleError({
                            error: error,
                            callbacks: {
                                400: response=>{
                                    this.props.enqueueSnackbar(response.data.message, {variant: "error"});
                                    dialog.setViewCtrl("")
                                }
                            }
                        }, this.props);
                    })
                    .finally(() => {
                        //do nothing
                        this.setState({isLoading:false});
                    })
            }
        })
        
    }


    onChange = (event)=>{
        let initial = {
            amount: this.state.amount,
            rate: this.state.rate,
            frequency: this.state.frequency,
            duration: this.state.duration,
            investment_date: this.state.investment_date,
        }
        initial[event.target.name] = event.target.value
        this.setState({[event.target.name]: event.target.value})

        //Do Calculate 
            let total_interest = ((parseFloat(initial.amount) * parseFloat(initial.rate)) / (365 * 100)) * parseInt(initial.duration);
            this.setState({total_interest: total_interest})
            let frequency_roi = 0
            if(initial.frequency == 'monthly'){
                frequency_roi = total_interest/parseInt(initial.duration/30)
            }else{
                frequency_roi = total_interest
            }
            this.setState({frequency_roi:frequency_roi})
            let total_amount = 0
            total_amount = parseFloat(initial.amount) + parseFloat(total_interest)
            this.setState({total_amount: total_amount})

        if(initial.duration && initial.investment_date){
            var date = new Date(initial.investment_date);
            date.setDate(date.getDate() + parseInt(initial.duration))
            this.setState({maturity_date: date.toISOString().substr(0,10)})
        }
        else{
            this.setState({maturity_date: " "})
        }
    }

  render(){
    return(
        <Page
        title="Add Investment"
        className={this.props.classes.root}
    >
        <Container 
            maxWidth={false}
            className={this.props.classes.container}
        >
           <Card>
               <CardHeader 
                    title="Create Investments" 
                    subheader="Create and manage customers Investment"
                />
                <Divider/>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="customer"
                                label="Customer"
                                value={this.state.customer}
                                onChange={e=>(this.setState({customer:e.target.value}))}
                                select
                            >
                                {
                                    this.state.customers.map((customer,index)=>(
                                        <MenuItem value={customer.id}>{`${customer.surname} ${customer.first_name} ${customer.other_name}`}</MenuItem>
                                    ))
                                }
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="amount"
                                label="amount"
                                value={this.state.amount}
                                onChange={this.onChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="rate"
                                label="Rate"
                                value={this.state.rate}
                                onChange={this.onChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="frequency"
                                label="ROI Payment Frequency"
                                value={this.state.frequency}
                                onChange={this.onChange}
                                select
                            >
                                <MenuItem value="monthly">Monthly</MenuItem>
                                <MenuItem value="one-time">One Time</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="duration"
                                label="Duration"
                                value={this.state.duration}
                                onChange={this.onChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="investment_date"
                                label="Investment Date"
                                value={this.state.investment_date}
                                type="date"
                                onChange={this.onChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <FormControlLabel
                                label="Send Alert To Customer"
                                name="send_alert"
                                control={
                                    <Switch checked={this.state.send_alert} onChange={e=>this.setState({send_alert: this.state.send_alert ? false: true})} />
                                }
                            />
                        </Grid>
                    </Grid>
                    <Divider style={{marginTop: 30, marginBottom: 10}}/>
                    <Typography><strong>Preview</strong></Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Amount Invested</Typography>
                            <Typography variant="caption" component="p">&#8358;{parseFloat(this.state.amount).toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Rate</Typography>
                            <Typography variant="caption" component="p">{this.state.rate}%</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">ROI Payment Frequency</Typography>
                            <Typography variant="caption" component="p">&#8358;{this.state.frequency_roi.toLocaleString()} ({this.state.frequency})</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Total Interest</Typography>
                            <Typography variant="caption" component="p">&#8358;{parseFloat(this.state.total_interest).toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Total Amount</Typography>
                            <Typography variant="caption" component="p">&#8358;{parseFloat(this.state.total_amount).toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Duration</Typography>
                            <Typography variant="caption" component="p">{this.state.duration} Days</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Investment date</Typography>
                            <Typography variant="caption" component="p">{moment(this.state.investment_date).format("MMMM Do YYYY")}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Maturity Date</Typography>
                            <Typography variant="caption" component="p">{moment(this.state.maturity_date).format("MMMM Do YYYY")}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions>
                    {
                        this.state.isLoading ? (
                            <CircularProgress size={22} />
                        ) : (
                            <Button 
                                onClick={this.handleCreate} 
                                variant="contained" 
                                color="primary" 
                                disableElevation
                                disabled={!(this.state.customer && this.state.amount && this.state.rate && this.state.duration && this.state.investment_date)}
                            >
                                Save
                            </Button>
                        )
                    }
                </CardActions>
           </Card>
        </Container>
    </Page>
    )
  }
}

const mapStateToProps = (state) => ({
  session_token: state.session_token,
})
export default connect(mapStateToProps)(
    withSnackbar(
        withStyles(useStyles)(
            withPermission(VIEW_PERMISSION_NAME)(withConfirmationDialog(useRouter(AddInvestment))))));