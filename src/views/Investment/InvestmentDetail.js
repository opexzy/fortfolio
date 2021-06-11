/* eslint-disable */
import React, { Component, Fragment } from 'react';
import {
    Box, 
    Avatar, 
    createStyles, 
    withStyles,
    Typography,
    Grid,
    TextField,
    Container,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
} from '@material-ui/core';
import { ListAlt as ListIcon} from '@material-ui/icons'
import { orange, red, grey, deepOrange, green } from '@material-ui/core/colors'
import moment from 'moment'
import { withSnackbar } from 'notistack';
import { connect } from 'react-redux'
import withConfirmationDialog from 'src/utils/confirmationDialog'
import { setReservations, setSales, setFoods, setDrinks} from 'src/actions'
import TableMaker from 'src/components/TableMaker';
import StatusBadge from 'src/components/StatusBadge';
import AppConfig from 'src/config/appConfig';


const useStyles = createStyles(theme => ({
    root: {
        backgroundColor: '#fff',
        padding: theme.spacing(2),
    },
    list:{
        marginTop:-20,
    },
    button:{
        justifyContent: "left",
        borderRadius: 0
    },
    avatarCredit:{
        backgroundColor: deepOrange[500],
    },
    listText:{
        whiteSpace: "nowrap",
        textOverflow: "ellipsis"
    },
    primaryText:{
        fontSize: 12,
    },
    secondaryText:{
        fontSize: 11,
    },
    amount:{
        textAlign: "right",
        fontSize: 12,
        fontWeight: 600
    },
    status:{
        textAlign: "right",
        fontSize: 11,
    },
    title:{
        fontWeight: 600,
        marginBottom: 5,
        fontSize: 14,
        width: "50%"
    },
    td:{
        height: 60,
        padding: 3,
        fontSize: 13,
    },
    text:{
        fontSize: 14,
        marginBottom: 5,
        width: "50%",
        borderBottomStyle: "dotted",
        borderBottomWidth: 1,
        padding: 2
    },
    text1:{
        fontSize: 14,
        marginBottom: 5,
        color: grey[800],
        width: "50%",
        borderBottomStyle: "dotted",
        borderBottomWidth: 1,
        padding: 2
    }
}))


class InvestmentDetail extends Component
{
    constructor(props){
        super(props)
    }

    calcFRoi = ()=>{
        let frequency_roi = 0
            if(this.props.data.roi_payment_frequency == 'monthly'){
                frequency_roi = this.props.data.total_interest/parseInt(this.props.data.duration/30)
            }else{
                frequency_roi = this.props.data.total_interest
            }
        return frequency_roi;
    }

    unitToCurrency = (unit) =>{
        if(unit == 'btc'){
            return 'Bitcoin (BTC)'
        }
        else if(unit == 'eth'){
            return 'Ethereum (ETH)'
        }
        else if(unit == 'bch'){
            return 'Bitcoin Cash (BCH)'
        }
        else if(unit == 'xrp'){
            return 'Ripple (XRP)'
        }
        else{
            return 'TetherUS (USDT)'
        }
    }
    render(){
        return(
            <Container style={{width: "19cm", marginTop:30, padding:10}}>
                <Box display="flex" flexDirection="row" justifyContent="space-between">
                    <Box>
                        <Avatar
                            style={{height: 100, width: 100}}
                            variant="rounded"
                        />
                    </Box>
                    <Box>
                        <Typography style={{color:red[600]}} variant="h2" component="h2">{AppConfig.company_name}</Typography>
                        <Typography style={{color:grey[600], fontSize:13}}>{AppConfig.company_address_line1}</Typography>
                        <Typography style={{color:grey[600], fontSize:13}}>{AppConfig.company_address_line2}</Typography>
                        <Typography style={{color:grey[600], fontSize:13}}>Tel: {AppConfig.company_mobile}</Typography>
                        <Typography style={{color:grey[600], fontSize:13}}>Email: {AppConfig.company_email}</Typography>
                    </Box>
                </Box>
                <Divider style={{marginTop:15, marginBottom:15}}/>
                <Box>
                    <Typography style={{textAlign:"center", marginBottom: 20}}>Investment Details</Typography>
                </Box>
                <Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Full Name</Typography>
                            <Typography variant="caption" component="p">
                                {`${this.props.data.customer.surname} ${this.props.data.customer.first_name} ${this.props.data.customer.other_name}`}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Account No.</Typography>
                            <Typography variant="caption" component="p">
                                {`${this.props.data.customer.account_no}`}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Amount Invested</Typography>
                            {this.props.is_fiat ? (
                                <Typography variant="caption" component="p">&#8358;{parseFloat(this.props.data.amount).toLocaleString()}</Typography>
                            ) : (
                                <Typography variant="caption" component="p">${parseFloat(this.props.data.amount).toLocaleString()}</Typography>
                            )}
                        </Grid>
                        {!this.props.is_fiat && 
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Crypto Asset</Typography>
                            <Typography variant="caption" component="p">{this.unitToCurrency(this.props.data.asset)}</Typography>
                        </Grid>
                        }
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Rate</Typography>
                            <Typography variant="caption" component="p">{this.props.data.rate}%</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">ROI Payment Frequency</Typography>
                            {this.props.is_fiat ? (
                                <Typography variant="caption" component="p">&#8358;{parseFloat(this.calcFRoi()).toLocaleString()} ({this.props.data.roi_payment_frequency})</Typography>
                            ) : (
                                <Typography variant="caption" component="p">${parseFloat(this.calcFRoi()).toLocaleString()} ({this.props.data.roi_payment_frequency})</Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Total Interest</Typography>
                            {this.props.is_fiat ? (
                                <Typography variant="caption" component="p">&#8358;{parseFloat(this.props.data.total_interest).toLocaleString()}</Typography>
                            ) : (
                                <Typography variant="caption" component="p">${parseFloat(this.props.data.total_interest).toLocaleString()}</Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Total Amount</Typography>
                            {this.props.is_fiat ? (
                                <Typography variant="caption" component="p">&#8358;{parseFloat(this.props.data.total_amount).toLocaleString()}</Typography>
                            ) : (
                                <Typography variant="caption" component="p">${parseFloat(this.props.data.total_amount).toLocaleString()}</Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Duration</Typography>
                            <Typography variant="caption" component="p">{this.props.data.duration} Days</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Investment date</Typography>
                            <Typography variant="caption" component="p">{moment(this.props.data.investment_date).format("MMMM Do YYYY")}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Maturity Date</Typography>
                            <Typography variant="caption" component="p">{moment(this.props.data.maturity_date).format("MMMM Do YYYY")}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3}>
                            <Typography variant="h6" component="h6">Status</Typography>
                            <Typography variant="caption" component="p">{this.props.data.status}</Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        )
    }
}

export default withStyles(useStyles)(InvestmentDetail)