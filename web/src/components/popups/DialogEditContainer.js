import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { API_DATA_CALL } from '../../utils/api';
import { FormHelperText } from '@mui/material';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


export default function DialogEditContainer(props) {
  const [type, setType] = React.useState(
    props.row ? JSON.parse(props.row).type : ''
  );

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const pk = data.get('pk');
    return await API_DATA_CALL(
      'PATCH',
      `/container/${pk}/`,
      {
        'type': data.get('type'),
        'liters': data.get('liters'),
      }
    ).then(response => {
      if (response.pk){
        window.location.reload();
      } else {
        navigate('/RegistrationFail');
      }
    });
  };

  const data = props.row ? JSON.parse(props.row) : {
    'pk': '',
    'type': '',
    'liters': '',
  };


  return (
    <Dialog open={props.open}
      onClose={props.onClose}
      TransitionComponent={Transition}
    >
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogTitle>Modify selected container info</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Edit container data.
          </DialogContentText>
          <Grid container justifyContent="center">
            <TextField value={data.pk} 
              id="pk"
              name="pk" 
              sx={{ display: "none" }}
            />
            <FormControl sx={{ width: "100%", mt: 3 }}>
              <InputLabel>{data.type}</InputLabel>
                <Select id="type"
                  name="type"
                  value={type}
                  variant="standard"
                  onChange={(e) => {setType(e.target.value);}}
                >
                  <MenuItem value="Keg">Keg</MenuItem>
                  <MenuItem value="Growler">Growler</MenuItem>
                  <MenuItem value="Bottle">Bottle</MenuItem>
                </Select>
                <FormHelperText>Type</FormHelperText>
            </FormControl>
            <TextField margin="dense"
              id="liters"
              name="liters"
              label={data.liters}
              type="decimal"
              helperText="Liters"
              variant="standard"
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
