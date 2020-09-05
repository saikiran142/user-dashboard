import React, {useEffect, useState} from 'react'
import { makeStyles } from '@material-ui/core/styles';
//Database Connectiong
import {db} from '../../firebase';

//Table Imports
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from '@material-ui/icons/Delete';
import Grid from '@material-ui/core/Grid';

//Dialog Imports 
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';


//Custom Date
import TextField from '@material-ui/core/TextField';
import moment from 'moment';


//List 

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';


const useStyles = makeStyles(theme => ({
    table: {
      minWidth: 650,
    },
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        margin: 'auto',
        maxWidth: 800,
    },
  }));

function Users() {
    const classes = useStyles();
    const [usersList, setUsersList] = useState([]);
    const [openActivities, setOpenActivities] = useState(false);
    const [activities, setActivities] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    

    let tableDiv = null;
    let activityModalDiv = null;
    let activityModal = null
    
    //Initial Loading of the Users List
    useEffect(()=> {
        db.collection('users').onSnapshot(snapshot => {
            setUsersList(snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })))
        })
    }, [])
 
    // If Require Enable this to delete the user
    const deleteUser = (id) => {
        db.collection('users').doc(id).delete()
            .then( ()=>{
                alert("Deleted")
                }
            )
    }

    //Table Which shows the list of users
    tableDiv = (
        <Grid container spacing={2} className={classes.paper}>
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="right">Activity</TableCell>
                        <TableCell align="right">Delete</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {usersList.map((user) => (
                        <TableRow key={user.id}>
                        <TableCell component="th" scope="row" onClick={()=> handleClickOpen(user.id)} style={{cursor: 'pointer'}}>
                            {user.realName}
                        </TableCell>
                        <TableCell onClick={()=> handleClickOpen(user.id)} style={{cursor: 'pointer'}}>{user.email}</TableCell>
                        <TableCell align="right" onClick={()=> handleClickOpen(user.id)} onClick={()=> handleClickOpen(user.id)} style={{cursor: 'pointer'}}><VisibilityIcon style={{fill: "#292826"}}></VisibilityIcon></TableCell>
                        <TableCell align="right" 
                        // onClick={()=> deleteUser(user.id)}
                        ><DeleteIcon  style={{fill: "#292826"}}></DeleteIcon></TableCell>
                        <TableCell align="right">{}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    )

    //Store the current date to pass to the datepicker
    let currentDate = moment(new Date()).format("YYYY-MM-DD");

    //View Activities Icon Click
    const handleClickOpen = (id) => {
        setOpenActivities(true);
        //Get Data from Database of users-> activities
        db.collection('users').doc(id).collection('activityPeriods').get()
            .then( snapshot => {
                setSelectedUserId(id);
                let newData = [];
                newData = snapshot.docs.filter(doc => moment(doc.data().startTime).format("MMM Do YY") === moment(currentDate).format("MMM Do YY"))
                setActivities(newData.map(doc => ({...doc.data(),
                        id: doc.id
                    })
                ))
            })
            .catch(error => {
                //Console the error if error comes from backend
                console.log(error);
            })
      };
    
      //Close of Modal
      const handleClose = () => {
        setOpenActivities(false);
      };

    //Formating the Date to display in Full 
    const formatDate = (date) => {
        return moment(date).format('MMMM Do YYYY')
      }
    
    // Format the date to just show Time
      const formatTime = (start, end) => {
          let time = moment(start).format('h:mm:ss a') + ' - ' + moment(end).format('h:mm:ss a');
        return time
      }

    //List Of Activities By the User
    activityModalDiv = (
        <List className={classes.root}>
                {console.log("Length", activities.length)}
                {activities.map( ({startTime, endTime, id}) => {
                let formatedDate = formatDate(startTime);
                let formatedTime =formatTime(startTime, endTime);
                return (    
                    <ListItem key={id} style={{paddingLeft:'0px'}}>
                        <ListItemText primary={formatedDate} secondary={formatedTime} />
                    </ListItem>
                )
            })}
        </List>
      )

    //For Every Change of Calendar Date Value This Function Calls
    const getUserActivities = (date) => {
        let inputDate = new Date(date);
        // Fetching the Data from Database , If the is some data change it updates real time without data
        // Snapshot listens to every change 
        db.collection('users').doc(selectedUserId).collection('activityPeriods').onSnapshot( snapshot => {
            let newData = [];
            newData = snapshot.docs.filter(doc => moment(doc.data().startTime).format("MMM Do YY") === moment(inputDate).format("MMM Do YY"))
            console.log("New Data" , newData);
        //Setting the Activities of User with current selection
            setActivities(newData.map(doc => ({...doc.data(),
                    id: doc.id
                })
            ))
        
        })
    }

    //Activity Dialog Box
    activityModal = (
            <Dialog
            open={openActivities}
            onClose={handleClose}
            fullWidth = {true}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            >
            {/* Modal Which Opens on Click of View Activities */}

            {/* Modal Title */}
            <DialogTitle id="alert-dialog-title">{'User Active Time'}
            <div style={{padding:'20px', paddingLeft: '0px', paddingBottom: '0px'}}>
                <form noValidate>
                        <TextField
                            id="date"
                            label="Choose Date"
                            type="date"
                            defaultValue = {currentDate}
                            onChange={(event)=> getUserActivities(event.target.value)}
                            className={classes.textField}
                            InputLabelProps={{
                            shrink: true,
                            }}
                            style={{textAlign: 'right'}}
                        />
                    </form>
                </div>
            </DialogTitle>
            {/* Modal Content */}
            <DialogContent>
            {/* If There are Activities if Shows the List Else It Shows No Activities */}
            {activities.length>0 ? (activityModalDiv) : (<ListItem style={{paddingLeft:'0px'}}>
                    <ListItemText primary={'No Activities'} />
                </ListItem>)}
            </DialogContent>
            <DialogActions>
            {/* Close Button To close Modal */}
            <Button onClick={handleClose} color="primary" autoFocus>
                Close
            </Button>
            </DialogActions>
            </Dialog>
    )

    return (
        <div className={classes.root}>
            {usersList.length>0 ? (tableDiv) : (<p>No Data</p>)} 
            {activityModal}
        </div>
    )
}

export default Users;
