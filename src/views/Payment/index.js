/* eslint-disable */
import React from 'react';
import Page from 'src/components/Page';
import TableMaker from 'src/components/TableMaker';
import StatusBadge from 'src/components/StatusBadge';
import PopoverMenu from 'src/components/PopoverMenu';
import IconMenuItem from 'src/components/IconMenuItem';
import Toolbar from './Toolbar';
import getInitials from 'src/utils/getInitials';

import { Edit as EditIcon, 
    VpnKey as PermissionIcon, 
    Block as BlockIcon, 
    Check as CheckIcon,
    Lock as LockIcon,
    VpnLock,
    Settings,
    Person,
    PersonAdd,
    Delete,
    Refresh
} from '@material-ui/icons'
import { 
    TableRow,
    TableCell, 
    Avatar,
    withStyles,
    createStyles,
    Typography,
    Box,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Divider,
    Grid,
    TextField,
    DialogActions,
    CircularProgress,
    MenuItem
} from '@material-ui/core';
import { deepOrange } from '@material-ui/core/colors';
import { withSnackbar } from 'notistack';
import { connect } from 'react-redux'
import DataViewLoader from 'src/components/DataViewLoader';
import {makeRequest, handleError} from 'src/utils/axios-helper';
import { withPermission, useRouter } from 'src/utils';
import { setSelectedUser } from 'src/actions'
import DataLayoutWraper from 'src/layouts/DataLayoutWraper';
import qs from 'qs'
import moment from 'moment'
import ReactToPrint, { PrintContextConsumer } from 'react-to-print';
import PrintTemplate from './ReceiptTemplate'
import AppConfig from 'src/config/appConfig'

const useStyles = createStyles( theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    boxOuter:{
        display:"flex",
        flexDirection:"row",
        justifyContent:"left"
    },
    boxInner:{
        marginTop: 10,
        marginLeft: 5
    },
    avatar: {
        width: 40,
        height: 40,
        backgroundColor: deepOrange[400]
    },
    name:{
        fontSize: 12,
        color: '#111111',
        margin: 0
    },
    typo:{
        fontSize: 12,
    },
    position:{
        fontSize: 12,
        color: '#888888',
        marginTop: 2,
        fontStyle: "italic"
    }
}))

const VIEW_PERMISSION_NAME = [];

class Customer extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            columns: [
                {label:'Full Name'},
                {label:'Investment Ref'},
                {label:'Amount'},
                {label:'Status'},
                {label:'Narration'},
                {label:'Due Date'},
                {label:'Action'}
            ],
            rows: [],
            count: 0,
            page: 0,
            options: {
                rowsPerPage: AppConfig.rowsPerPage,
                onChangePage: this.onChangePage
            },
            isLoading: true,
            open: false,
            selectedStaff: null,
            selectedIndex: null,
            filters: null,
            policy_no: null,
            policy:null,
            amount: null,
            narration: null,
            payment_date:null,
            channel:null,
            teller_no:null,
            bank:null,
            isLoadingVerify: false,
            isLoadingPayment: false,
            isLoadingAction: false,
            openPrint: false,
            isLoadingPrint: true,
            receiptData: null
        }
    }
    
    onChangePage = (event, page) =>{
        this.setState({isLoading:true, page: page})
        makeRequest(this.props).post('/payment/list/' + (page+1), qs.stringify(this.state.filters))
        .then(response => {
           this.setState({
               rows:response.data.data.list,
               count: response.data.data.count
            })
        })
        .catch(error => {
            handleError({
                error: error,
                callbacks: {
                400: response=>{ this.props.enqueueSnackbar(response.data.message, {variant: "error"}); }
                }
            }, this.props);
        })
        .finally(() => {
            this.setState({isLoading:false});
        })
    }

    statusToBadgeVariant = status =>{
        if(status){
            return "active";
        }
        else{
            return "inactive";
        }
    }

    clearFields = ()=>{
        this.setState({
            policy_no: "",
            amount: "",
            narration: "",
            payment_date: "",
            channel: "",
            period_cover: "",
            bank: "",
            teller_no:"",
            policy:null
        })
    }

    componentDidMount(){
        //check if token is valid
        makeRequest(this.props).post('/payment/list')
            .then(response => {
                this.setState({rows: response.data.data.list, count: response.data.data.count})
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

    searchHandler = filters =>{
        this.setState({isLoading:true, page: 0})
        makeRequest(this.props).post('/payment/list', qs.stringify(filters))
        .then(response => {
           this.setState({
               rows:response.data.data.list,
               count: response.data.data.count,
               filters
            })
        })
        .catch(error => {
            handleError({
                error: error,
                callbacks: {
                400: response=>{ this.props.enqueueSnackbar(response.data.message, {variant: "error"}); }
                }
            }, this.props);
        })
        .finally(() => {
            this.setState({isLoading:false});
        })
    }

    updateRow = (data) =>{
        let rows = []
        this.state.rows.forEach(row => {
            if(row.id == data.id){
                rows.push(data)
            }
            else{
                rows.push(row)
            }
        });
        this.setState({rows: rows})
    }

    reload = () =>{
        this.setState({
            isLoading: true,
        })
        this.componentDidMount()
    }

    handleMakePayment = ()=>{
        this.setState({isLoadingPayment:true});
        makeRequest(this.props).post('/payment/add', qs.stringify({
            policy_no: this.state.policy_no,
            amount: this.state.amount,
            narration: this.state.narration,
            payment_date: this.state.payment_date,
            channel: this.state.channel,
            period_cover: this.state.period_cover,
            bank: this.state.bank,
            teller_no: this.state.teller_no
        }))
        .then(response => {
            this.props.enqueueSnackbar(response.data.message, {variant: "success"});
            this.reload();
            this.clearFields();
        })
        .catch(error => {
            handleError({
                error: error,
                callbacks: {
                400: response=>{ this.props.enqueueSnackbar(response.data.message, {variant: "error"}); }
                }
            }, this.props);
        })
        .finally(() => {
            this.setState({isLoadingPayment:false});
        })
    }

    approvePayment = (reference)=>{
        this.setState({isLoadingAction:true});
        makeRequest(this.props).get('/payment/approve/'+reference)
        .then(response => {
            this.props.enqueueSnackbar(response.data.message, {variant: "success"});
            this.reload();
        })
        .catch(error => {
            handleError({
                error: error,
                callbacks: {
                400: response=>{ this.props.enqueueSnackbar(response.data.message, {variant: "error"}); }
                }
            }, this.props);
        })
        .finally(() => {
            //Do nothing
            this.setState({isLoadingAction:false});
        })
    }

    printReceipt = (reference) => {
        this.setState({openPrint:true, isLoadingPrint:true})
        makeRequest(this.props).get('/payment/receipt/'+reference)
        .then(response => {
            this.setState({receiptData:response.data.data, isLoadingPrint:false})
        })
        .catch(error => {
            handleError({
                error: error,
                callbacks: {
                400: response=>{ this.props.enqueueSnackbar(response.data.message, {variant: "error"}); }
                }
            }, this.props);
        })
        .finally(() => {
            //Do nothing
        })
    }


    render(){
        return(
            <Page
                className={this.props.classes.root}
                title="Payment"
                >

                <Container maxWidth={false}>
                    <Box mt={3}>
                    <DataLayoutWraper sectionHeading="Payment History" searchHandler={this.searchHandler} reloadHandler={this.reload}>
                        <DataViewLoader isLoading={this.state.isLoading} data={this.state.rows}>
                            <TableMaker columns={this.state.columns} page={this.state.page} count={this.state.count} options={this.state.options}>
                                {this.state.rows.map((row, index) => (
                                    <TableRow hover key={row.staff_id}>
                                        <TableCell align="left">
                                            <Box className={this.props.classes.boxOuter}>
                                                <Avatar 
                                                    src={''} 
                                                    className={this.props.classes.avatar}
                                                >
                                                    {getInitials(row.customer.first_name + " " + row.customer.surname)} 
                                                </Avatar>
                                                <Box className={this.props.classes.boxInner}>
                                                    <p className={this.props.classes.name}>{row.customer.surname + " " + row.customer.first_name + " " + row.customer.other_name}</p>
                                                    <p className={this.props.classes.position}>Ref: #{row.id}</p>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography className={this.props.classes.typo} style={{fontStyle: "italic"}}>
                                                #{row.investment_id}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            {row.investment_type == "fiat" ? (
                                                <Typography className={this.props.classes.typo}>
                                                    &#8358;{parseFloat(row.amount).toLocaleString({minimumFractionDigits:2})}
                                                </Typography>
                                            ) : (
                                                <Typography className={this.props.classes.typo}>
                                                    ${parseFloat(row.amount).toLocaleString({minimumFractionDigits:2})}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <StatusBadge 
                                                variant={row.status}
                                            > 
                                                {row.status} 
                                            </StatusBadge>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography className={this.props.classes.typo} style={{textTransform: "capitalize"}}>
                                                {row.type == "interest" ? row.roi_payment_frequency+" Interest Payment" : "Capital Refund"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography className={this.props.classes.typo}>
                                                {moment(row.payment_date).format("Do MMMM, YYYY")}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <PopoverMenu>
                                                {
                                                    this.state.isLoadingAction ? (
                                                        <CircularProgress size={20}/>
                                                    ) : (
                                                        <>
                                                            <IconMenuItem 
                                                                icon={<CheckIcon color="primary"/>} 
                                                                text="Approve" 
                                                                disabled={row.status!="pending"}
                                                                onClick={evt => this.approvePayment(row.id)}
                                                            />
                                                        </>
                                                    )
                                                }
                                                
                                            </PopoverMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}    
                            </TableMaker>
                        </DataViewLoader>
                    </DataLayoutWraper>
                </Box>
            </Container>
        </Page>
        )
    }
};

const mapStateToProps = (state) => ({
    session_token: state.session_token,
    staffs: state.users,
  })
export default connect(mapStateToProps)(
    withSnackbar(
        withPermission(VIEW_PERMISSION_NAME)(
        withStyles(useStyles)(
            useRouter(Customer)))));
