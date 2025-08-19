import React from 'react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Accordion from 'react-bootstrap/Accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocation } from '@fortawesome/free-solid-svg-icons'


import './PlantPanel.css';

const LocationButton = ({x, y, setDesiredPos}) => {
    return (
      <Button
        className='location-button'
        onClick={() => setDesiredPos([x, y, 0])}
      >
        <Row>
          <Col xs={6}>
            X:{x}
          </Col>
          <Col xs={6}>
            Y:{y}
          </Col>  
        </Row>  
      </Button>
    );
};

const PlantPanel = React.memo((props) => {
  function fillInLocation(x, y) {
    document.getElementById(x).value = props.robotPos[0];
    document.getElementById(y).value = props.robotPos[1];
  }

  async function addPlant(name, ml_response, moisture_threshhold, sense_x, sense_y, plant_x, plant_y) {
    // Check that all the fields are filled in
    if (name === "" ||
        ml_response === "" ||
        moisture_threshhold === "" ||
        sense_x === "" || sense_y === "" ||
        plant_x === "" || plant_y === "") {
      alert("Please fill in all fields");
      return;
    }

    // Check if the name is longer than 9 characters
    if (name.length > 9) {
      alert("Plant name must be no more than 9 characters");
      return;
    }

    // Check that all the fields are numbers
    if (isNaN(ml_response) ||
        isNaN(moisture_threshhold) ||
        isNaN(sense_x) || isNaN(sense_y) ||
        isNaN(plant_x) || isNaN(plant_y))
    {
      alert("Paramater fields must be numbers");
      return;
    }

    // Check that the ml_response is between 0 and 255
    if (ml_response < 0 || ml_response > 255) {
      alert("Water amount must be between 0 and 255");
      return;
    }

    // Check that the moisture_threshhold is between 0 and 100
    if (moisture_threshhold < 0 || moisture_threshhold > 100) {
      alert("Moisture threshold must be between 0 and 100");
      return;
    }

    // Check that the ml_response and moisture_threshhold are integers
    if (ml_response % 1 !== 0 || moisture_threshhold % 1 !== 0) {
      alert("Water amount and moisture threshold must be integers");
      return;
    }

    // Check that all locations are within the farm
    if (sense_x < 0 || sense_x >= props.farmData.gantry_size[0] ||
        sense_y < 0 || sense_y >= props.farmData.gantry_size[1] ||
        plant_x < 0 || plant_x >= props.farmData.gantry_size[0] ||
        plant_y < 0 || plant_y >= props.farmData.gantry_size[1])
    {
      alert("All locations must be within the farm");
      return;
    }

    console.log(props.farmData)

    if (props.sendCommand) {
      try {
        //CHA as in change
      while (true){
        var plant_id = Math.floor(Math.random() * (1500 - 1) + 1);
        console.log("Plant ID: ", plant_id);
        if (!Object.values(props.farmData.plants).some(plant => plant.id === plant_id)) {
          break; // Found a unique ID
        }
      }
      //var id_nuevo = Object.keys(props.farmData.plants).length + 1;
      await props.sendCommand(`CHA,4,${name},${sense_x},${sense_y},${plant_x},${plant_y},${moisture_threshhold},${ml_response},${plant_id}`);
      
      const newFarmData = {
        ...props.farmData,
        plants: {
          ...props.farmData.plants,
          [name]: {
            "ml_response": parseInt(ml_response),
            "moisture_threshhold": parseInt(moisture_threshhold),
            "sense": [parseInt(sense_x), parseInt(sense_y)],
            "location": [parseInt(plant_x), parseInt(plant_y)],
            "id": plant_id
          }
        }
      };
      
      // Update the state with the new data
      props.setFarmData(newFarmData);
      
      // Clear the input fields after adding
      document.getElementById('plant_name').value = '';
      document.getElementById('water_amount').value = '';
      document.getElementById('moisture_threshold').value = '';
      document.getElementById('sense_x').value = '';
      document.getElementById('sense_y').value = '';
      document.getElementById('plant_x').value = '';
      document.getElementById('plant_y').value = '';
      
      } catch (error) {
        console.error("Error sending command:", error);
        alert("Failed to add plant. Please try again.");
      }
    }
    
  }
   return (
    <div
      className="scrollable-panel"
      style={{
        display: 'flex',
        width: '300px',
        flexDirection: 'column',
        justifyContent: 'left',
        alignItems: 'left',
        color: 'white',
        passing: '10px',
        margin: '10px',
        height: '400px', // Set a fixed height
        overflowY: 'auto', // Make the panel scrollable vertically
        overflowX: 'hidden',
      }}
    >
      <Accordion defaultActiveKey="0">
        {Object.keys(props.farmData.plants).map((plant, index) => (
          <Accordion.Item eventKey={index} key={index}>
            <Accordion.Header>
              {plant}
            </Accordion.Header>
            <Accordion.Body>
                <table>
                    <tbody>
                        <tr>
                            <td>Sense</td>
                            <td
                                style={{
                                    textAlign: 'right',
                                }}
                            >
                                <LocationButton x={props.farmData.plants[plant].sense[0]} y={props.farmData.plants[plant].sense[1]} setDesiredPos={props.setDesiredPos}/>
                            </td>
                        </tr>
                        <tr>
                            <td>Plant</td>
                            <td
                                style={{
                                    textAlign: 'right',
                                }}
                            >
                                <LocationButton x={props.farmData.plants[plant].location[0]} y={props.farmData.plants[plant].location[1]} setDesiredPos={props.setDesiredPos}/>
                            </td>
                        </tr>
                        <tr>
                            <td>Water Amount</td>
                            <td
                                style={{
                                    textAlign: 'right',
                                }}
                            >{props.farmData.plants[plant].ml_response}</td>
                        </tr>
                        <tr>
                            <td>Moisture Threshold</td>
                            <td
                                style={{
                                    textAlign: 'right',
                                }}
                            >
                                {props.farmData.plants[plant].moisture_threshhold}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <Button
                  style={{
                    width: '100%',
                  }}
                  variant="outline-light"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this plant?')) {
                      props.deletePlant(plant);        
                    }
                  }}
                >
                  Delete Plant
                </Button>
            </Accordion.Body>
          </Accordion.Item>
        ))}
        
      
        <Accordion.Item>
        <Accordion.Header>
          Add Plant
        </Accordion.Header>
        <Accordion.Body>
          <table
            style={{
              width: '100%',
            }}
          >
            <tbody>
              <tr>
                <th className='data-cell'>Plant Name:</th>
                <td className='data-cell-right'>
                  <input style={{ width: '110px' }} id="plant_name" type="text" placeholder="plant name"/>
                </td>
              </tr>
              <tr>
                <th className='data-cell'>Location</th>
              </tr>
              <tr>
                <th className='data-cell'>Sense</th>
                <td className='data-cell-right'>
                  <div className="input-container">
                    <input style={{ width: '60px' }} id="sense_x" type="text" placeholder="X"/>
                    <input style={{ width: '60px' }} id="sense_y" type="text" placeholder="Y"/>
                    <Button
                      size="sm"
                      variant="outline-light"
                      onClick={() => fillInLocation("sense_x", "sense_y")}
                    >
                      <FontAwesomeIcon icon={faLocation} />
                    </Button>
                  </div>
                </td>
              </tr>
              <tr>
                <th className='data-cell'>Plant</th>
                <td className='data-cell-right'>
                  <div className="input-container">
                    <input style={{ width: '60px' }} id="plant_x" type="text" placeholder="X"/>
                    <input style={{ width: '60px' }} id="plant_y" type="text" placeholder="Y"/>
                    <Button
                      size="sm"
                      variant="outline-light"
                      onClick={() => fillInLocation("plant_x", "plant_y")}
                    >
                      <FontAwesomeIcon icon={faLocation} />
                    </Button>
                  </div>
                </td>
              </tr>
              <tr>
                <th className='data-cell'>Water Amount:</th>
                <td className='data-cell-right'>
                  <input style={{ width: '110px' }} id="water_amount" type="text" placeholder="ml"/>
                </td>
              </tr>
              <tr>
                <th className='data-cell'>Moisture Threshold:</th>
                <td className='data-cell-right'>
                  <input style={{ width: '80px' }} id="moisture_threshold" type="text" placeholder="%"/>
                </td>
              </tr>
            </tbody>
          </table>
          
          <Button
            style={{
              width: '100%',
            }}
            variant="outline-light"
            onClick={() => addPlant(
              document.getElementById('plant_name').value,
              document.getElementById('water_amount').value,
              document.getElementById('moisture_threshold').value,
              document.getElementById('sense_x').value,
              document.getElementById('sense_y').value,
              document.getElementById('plant_x').value,
              document.getElementById('plant_y').value
            )}
          >
            Add Plant
          </Button>
          </Accordion.Body>
      </Accordion.Item>

      </Accordion>
      </div>
    );
});

export default PlantPanel;







