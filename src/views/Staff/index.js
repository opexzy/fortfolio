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
    PersonAdd
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
} from '@material-ui/core';
import { deepOrange } from '@material-ui/core/colors';
import { withSnackbar } from 'notistack';
import { connect } from 'react-redux'
import DataViewLoader from 'src/components/DataViewLoader';
import {makeRequest, handleError} from 'src/utils/axios-helper';
import { withPermission, useRouter } from 'src/utils';
import { setSelectedUser } from 'src/actions'
import EditStaffDialog from './EditStaffDialog';
import DataLayoutWraper from 'src/layouts/DataLayoutWraper';
import qs from 'qs'
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
        marginTop: 0,
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
        fontSize: 11,
        color: '#888888',
        marginTop: 2
    }
}))

const VIEW_PERMISSION_NAME = [];

class Staffs extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            columns: [
                {label:'Full Name'},
                {label:'Username'},
                {label:'Email'},
                {label:'Status'},
                {label:'Gender'},
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
            filters: null
        }
    }
    
    onChangePage = (event, page) =>{
        this.setState({isLoading:true, page: page})
        makeRequest(this.props).post('/admin/list/' + (page+1), qs.stringify(this.state.filters))
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
        //check if token is valid
        makeRequest(this.props).post('/admin/list')
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
        makeRequest(this.props).post('/admin/list', qs.stringify(filters))
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

    handleAddToAgent = (staff)=>{
        makeRequest(this.props).post('/agent/add', qs.stringify({staff_id:staff.id}))
        .then(response => {
            this.props.enqueueSnackbar(response.data.message, {variant: "success"});
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

    staffStatus = (type,staff)=>{
        makeRequest(this.props).post('/admin/status', qs.stringify({id:staff.id, status:type}))
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
        })
    }

    render(){
        return(
            <Page
                className={this.props.classes.root}
                title="Staffs"
                >
                <EditStaffDialog 
                    staff={this.state.selectedStaff} 
                    updateRow={this.updateRow} 
                    open={this.state.open} 
                    onClose={e=>this.setState({open:false})}
                />
                <Container maxWidth={false}>
                    <Toolbar />
                    <Box mt={3}>
                    <DataLayoutWraper sectionHeading="Staff Accounts" searchHandler={this.searchHandler} reloadHandler={this.reload}>
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
                                                    {getInitials(row.first_name + " " + row.last_name)} 
                                                </Avatar>
                                                <Box className={this.props.classes.boxInner}>
                                                    <p className={this.props.classes.name}>{row.first_name + " " + row.last_name}</p>
                                                    <p className={this.props.classes.position}>{row.position}</p>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography className={this.props.classes.typo}>
                                                {row.username}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography className={this.props.classes.typo}>
                                                {row.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <StatusBadge 
                                                variant={this.statusToBadgeVariant(row.is_active)}
                                            > 
                                                {this.statusToBadgeVariant(row.is_active)} 
                                            </StatusBadge>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography className={this.props.classes.typo}>
                                                {row.gender}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <PopoverMenu>
                                                <IconMenuItem 
                                                    icon={<EditIcon color="primary"/>} 
                                                    text="View/Edit" 
                                                    onClick={evt => this.setState({selectedStaff:row, open:true})}
                                                />
                                                {(row.is_active == 1) ? (
                                                    <IconMenuItem onClick={evt =>this.staffStatus("inactive",row)} icon={<BlockIcon color="primary"/>} text="Deactivate"/>
                                                ) : (
                                                    <IconMenuItem onClick={evt =>this.staffStatus("active",row)} icon={<LockIcon color="primary"/>} text="Activate"/>
                                                )}
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
            useRouter(Staffs)))));
