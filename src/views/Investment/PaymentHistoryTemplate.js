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
    TableRow,
    TableCell
} from '@material-ui/core';
import { ListAlt as ListIcon} from '@material-ui/icons'
import { red, grey, deepOrange, green } from '@material-ui/core/colors'
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


class ReceiptPrintTemplate extends Component
{
    constructor(props){
        super(props)
        this.state = {
            columns: [
                {label:'Payment Ref'},
                {label:'Amount'},
                {label:'Due Date'},
                {label:'Narration'},
                {label:'Date Paid'},
            ],
            rows: [],
            count: 0,
            page: 0,
            options: {
                rowsPerPage: 5,
                onChangePage: this.onChangePage
            }
        }
    }

    render(){
        return(
            <Container style={{width: "19cm", marginTop:30, padding:10}}>
                <Box display="flex" flexDirection="row" justifyContent="space-between">
                    <Box>
                        <Avatar
                            src="/logo-main.png"
                            style={{height: 100, width: 100}}
                            variant="rounded"
                        />
                    </Box>
                    <Box>
                        <Typography style={{color:red[600]}} variant="h2" component="h2">{AppConfig.company_name}</Typography>
                        <Typography style={{color:grey[600], fontSize:13}}>{AppConfig.company_address}</Typography>
                        <Typography style={{color:grey[600], fontSize:13}}>Tel: {AppConfig.company_mobile}</Typography>
                        <Typography style={{color:grey[600], fontSize:13}}>Email: {AppConfig.company_email}</Typography>
                    </Box>
                </Box>
                <Divider style={{marginTop:15, marginBottom:15}}/>
                <Box>
                    <Typography style={{textAlign:"center", fontSize:13, color:green[700]}}>PAYMENT HISTORY</Typography>
                </Box>
                <Box>
                    <TableMaker columns={this.state.columns} print page={this.state.page} count={this.state.count}>
                        {this.props.data.payment_history ? (
                            this.props.data.payment_history.map((row,index)=>(
                                <TableRow hover key={index}>
                                    <TableCell style={{fontSize:11}} align="left">{row.id}</TableCell>
                                    <TableCell style={{fontSize:11}} align="left">&#8358;{parseFloat(row.amount).toLocaleString({minimumFractionDigits:2})}</TableCell>
                                    <TableCell style={{fontSize:11}} align="left">{moment(row.payment_date).format("MMMM Do YYYY")}</TableCell>
                                    <TableCell style={{fontSize:11}} align="left">{row.type == "interest" ? row.roi_payment_frequency+" Interest Payment" : "Capital Payment"}</TableCell>
                                    <TableCell style={{fontSize:11}} align="left">{moment(row.timestamp).format("MMMM Do YYYY")}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <Box width="100%" height="250px" justifyContent="center" alignItems="center">
                                <Typography style={{color:grey[600], fontSize:13}}>No payment made on this policy yet</Typography>
                            </Box>
                        )}
                    </TableMaker>
                    <Box>
                        <Typography style={{marginTop:20, fontSize:13, fontWeight:700, textAlign:"right"}}>Total Receipt: &#8358;{parseFloat(this.props.data.total_amount).toLocaleString({minimumFractionDigits:2})}</Typography>
                    </Box>
                    <Box>
                        <Typography style={{marginTop:10, fontSize:12, color:red[700]}}>
                            *Kindly reconcile the above statement of account on your policy. If there is any payment not reflecting
                            above, kindly supply us with details of such payment so as to assist us to reconcile your payment records rightly
                        </Typography>
                        <Typography style={{marginTop:10, fontSize:12, color:red[700]}}>
                            Thank You
                        </Typography>
                    </Box>
                </Box>
            </Container>
        )
    }
}

export default withStyles(useStyles)(ReceiptPrintTemplate)