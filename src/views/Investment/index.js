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
    Print,
    Commute,
    Delete,
    GamepadOutlined,
    History
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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Grid,
    TextField,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab'
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
import InvestmentDetail from './InvestmentDetail'
import PaymentPrintTemplate from './PaymentHistoryTemplate';
import AppConfig from 'src/config/appConfig'
import DataCard from 'src/components/DataCard'
import withConfirmationDialog from 'src/utils/confirmationDialog'

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

class Investment extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            columns: [
                {label:'Full Name'},
                {label:'Account No'},
                {label:'Amount Invested'},
                {label:'Rate'},
                {label:'Duration'},
                {label:'Maturity Date'},
                {label:'Status'},
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
            openPrint: false,
            isLoadingPrint: false,
            openPaymentPrint: false,
            isLoadingPayment: false,
            investmentData:null,
            paymentData:null,
            report: null,
            selected_date: null
        }
    }
    
    onChangePage = (event, page) =>{
        this.setState({isLoading:true, page: page})
        makeRequest(this.props).post('/investment/list/' + (page+1), qs.stringify(this.state.filters))
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

    componentDidMount(){
        this.fetch_investment_report()
        makeRequest(this.props).post('/investment/list')
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
        makeRequest(this.props).post('/investment/list', qs.stringify(filters))
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

    viewHistory = (id)=>{
        this.setState({openPaymentPrint:true,isLoadingPayment:true})
        makeRequest(this.props).get('payment/history/'+id)
        .then(response => {
            this.setState({paymentData: response.data.data})
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
            this.setState({isLoadingPayment:false})
        })
    }

    viewInvestment = (data) => {
        this.setState({openPrint:true, investmentData:data})
    }

    fetch_investment_report = () =>{
        makeRequest(this.props).get('investment/report'+(this.state.selected_date != null ? "/"+this.state.selected_date : ""))
        .then(response => {
            this.setState({report: response.data.data.report})
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
            this.setState({isLoadingPayment:false})
        })
    }

    onDateChange = evt =>{
        this.setState({report:null});
        makeRequest(this.props).get('investment/report/'+evt.target.value)
        .then(response => {
            this.setState({report: response.data.data.report})
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
            this.setState({isLoadingPayment:false})
        })
      this.setState({selected_date: evt.target.value})
    }

    delete = (id) =>{
        this.props.openDialog({
            viewCtrl: "warning",
            title: "Confirm Investment Delete",
            description: "All payments associated with this investment will be deleted",
            close: dialog =>{
                dialog.close()
            },
            confirm: dialog =>{
                makeRequest(this.props).get('/investment/delete/'+id)
                    .then(response => {
                        dialog.setViewCtrl("success")
                        dialog.setTitle("Removed!")
                        dialog.setDescription(
                            <Typography>
                                {response.data.message}
                            </Typography>
                        )
                        this.props.enqueueSnackbar(response.data.message, {variant: "success"}); 
                        this.reload()
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

    render(){
        return(
            <Page
                className={this.props.classes.root}
                title="Investment"
                >
                <Dialog open={this.state.openPrint} maxWidth="md" fullWidth onClose={e=>this.setState({openPrint:false})}>
                    <DialogTitle>Investment Details</DialogTitle>
                    <DialogContent>
                        <InvestmentDetail is_fiat={true} data={this.state.investmentData} ref={el => (this.componentRef = el)}/>
                    </DialogContent>
                    <DialogActions>
                        <ReactToPrint content={() => this.componentRef}>
                            <PrintContextConsumer>
                                {({ handlePrint }) => (
                                    <Button  onClick={handlePrint} variant="contained" color="primary">Print</Button>
                                )}
                            </PrintContextConsumer>
                        </ReactToPrint>
                    </DialogActions>
                </Dialog>

                <Dialog open={this.state.openPaymentPrint} maxWidth="md" fullWidth onClose={e=>this.setState({openPaymentPrint:false})}>
                    <DialogTitle>Payment History</DialogTitle>
                    <DialogContent>
                        {this.state.isLoadingPayment ? (
                            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                                <CircularProgress/>
                            </Box>
                        ):(
                            <PaymentPrintTemplate is_fiat={true} data={this.state.paymentData} ref={el => (this.componentRef = el)}/>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <ReactToPrint content={() => this.componentRef}>
                            <PrintContextConsumer>
                                {({ handlePrint }) => (
                                    <Button  onClick={handlePrint} variant="contained" color="primary">Print</Button>
                                )}
                            </PrintContextConsumer>
                        </ReactToPrint>
                    </DialogActions>
                </Dialog>

                <Container maxWidth={false}>
                    <Toolbar is_fiat={true} />
                    <Grid container spacing={2} style={{marginBottom:10, marginTop:15}}>
                        <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="selected_date"
                                label="Select Date"
                                value={this.state.selected_date}
                                type="date"
                                helperText="The day in the selected date is not relevant, only the month and the year are used"
                                onChange={this.onDateChange}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} style={{marginBottom:10, marginTop:15}}>
                        <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                            {this.state.report ? (
                                <DataCard 
                                title="ACTIVE INVESTMENTS" 
                                value={parseFloat(this.state.report.active_investment_amount).toLocaleString()}
                                extra={this.state.report.active_investment_no}
                            />
                            ) : (
                                <Skeleton animation="wave" height="100%" width="100%" />
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                            {this.state.report ? (
                                <DataCard 
                                    title="COMPLETED INVESTMENTS" 
                                    value={parseFloat(this.state.report.completed_investment_amount).toLocaleString()}
                                    extra={this.state.report.completed_investment_no}
                                />
                            ) : (
                                <Skeleton animation="wave" height="100%" width="100%" />
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                            {this.state.report ? (
                                <DataCard 
                                    title="INTEREST DUE THIS MONTH" 
                                    value={parseFloat(this.state.report.interest_due_amount).toLocaleString()}
                                    extra={this.state.report.interest_due_no}
                                />
                            ) : (
                                <Skeleton animation="wave" height="100%" width="100%" />
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                            {this.state.report ? (
                                <DataCard 
                                    title="INTEREST PAID THIS MONTH" 
                                    value={parseFloat(this.state.report.interest_paid_amount).toLocaleString()}
                                    extra={this.state.report.interest_paid_no}
                                />
                            ) : (
                                <Skeleton animation="wave" height="100%" width="100%" />
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                            {this.state.report ? (
                                <DataCard 
                                    title="CAPITAL DUE THIS MONTH" 
                                    value={parseFloat(this.state.report.capital_due_amount).toLocaleString()}
                                    extra={this.state.report.capital_due_no}
                                />
                            ) : (
                                <Skeleton animation="wave" height="100%" width="100%" />
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                            {this.state.report ? (
                                <DataCard 
                                    title="CAPITAL PAID THIS MONTH" 
                                    value={parseFloat(this.state.report.capital_paid_amount).toLocaleString()}
                                    extra={this.state.report.capital_paid_no}
                                />
                            ) : (
                                <Skeleton animation="wave" height="100%" width="100%" />
                            )}
                        </Grid>
                    </Grid>
                    <Box mt={3}>
                    <DataLayoutWraper sectionHeading="Customers" searchHandler={this.searchHandler} reloadHandler={this.reload}>
                        <DataViewLoader isLoading={this.state.isLoading} data={this.state.rows}>
                            <TableMaker columns={this.state.columns} page={this.state.page} count={this.state.count} options={this.state.options}>
                                {this.state.rows.map((row, index) => (
                                    <TableRow hover key={row.id}>
                                        <TableCell align="left">
                                            <Box className={this.props.classes.boxOuter}>
                                                <Avatar 
                                                    src={''} 
                                                    className={this.props.classes.avatar}
                                                >
                                                    {getInitials(row.customer.account_type == "corporate" ? "C O" : row.customer.first_name + " " + row.customer.surname)} 
                                                </Avatar>
                                                <Box className={this.props.classes.boxInner}>
                                                    {row.customer.account_type == "corporate" ? (
                                                        <>
                                                            <p className={this.props.classes.name}>{row.customer.corporate_name}</p>
                                                            <p className={this.props.classes.position}>Ref: #{row.id}</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className={this.props.classes.name}>{row.customer.surname + " " + row.customer.first_name + " " + row.customer.other_name}</p>
                                                            <p className={this.props.classes.position}>Ref: #{row.id}</p>
                                                        </>
                                                    )}
                                                    
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography className={this.props.classes.typo}>
                                                {row.account_no}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography className={this.props.classes.typo}>
                                                &#8358;{parseFloat(row.amount).toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography className={this.props.classes.typo}>
                                                {row.rate}%
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography className={this.props.classes.typo}>
                                                {row.duration} Days
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography className={this.props.classes.typo}>
                                                {moment(row.maturity_date).format("Do MMMM, YYYY")}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <StatusBadge variant={row.status}>
                                                {row.status}
                                            </StatusBadge>
                                        </TableCell>
                                        <TableCell align="center">
                                            <PopoverMenu>
                                                <IconMenuItem 
                                                    icon={<EditIcon color="primary"/>} 
                                                    text="View" 
                                                    onClick={e=>this.viewInvestment(row)}
                                                />
                                                <IconMenuItem 
                                                    icon={<Delete color="primary"/>} 
                                                    text="Delete" 
                                                    onClick={e=>this.delete(row.id)}
                                                />
                                                <IconMenuItem 
                                                    icon={<History color="primary"/>} 
                                                    text="History"
                                                    onClick={e=>this.viewHistory(row.id)} 
                                                />
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
            useRouter(withConfirmationDialog(Investment))))));
