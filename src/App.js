import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Input = styled.input`
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Select = styled.select`
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #2980b9;
  }
`;

const CourtCard = styled.div`
  background-color: #f0f0f0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const CourtTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 10px;
`;

const CourtInfo = styled.p`
  margin: 5px 0;
  color: #34495e;
`;

const BookingLink = styled.a`
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 10px 15px;
  text-decoration: none;
  border-radius: 5px;
  margin-top: 10px;

  &:hover {
    background-color: #2980b9;
  }
`;

const ClearButton = styled.button`
  background-color: #e74c3c;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 10px;

  &:hover {
    background-color: #c0392b;
  }
`;

const HourRangeContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const canchas = ["Cancha Tenis 1", "Cancha Tenis 2", "Cancha Tenis 3", "Cancha Tenis 4"];
const recintos = {
  804: "Germán Becker",
  855: "Labranza"
};
const hours = Array.from({length: 13}, (_, i) => i + 8);

function App() {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRecintos, setSelectedRecintos] = useState([]);
  const [daysToIterate, setDaysToIterate] = useState(1);
  const [selectedCanchas, setSelectedCanchas] = useState([]);
  const [startHour, setStartHour] = useState('');
  const [endHour, setEndHour] = useState('');
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      console.log('Sending request with data:', { startDate, selectedRecintos, daysToIterate, selectedCanchas, startHour, endHour });
      const response = await axios.post('https://reserva-node.onrender.com/courts', {
        startDate,
        selectedRecintos,
        daysToIterate,
        selectedCanchas,
        startHour,
        endHour
      });
      console.log('Received response:', response.data);
      if (response.data.length === 0) {
        setMessage('No se encontraron resultados para la búsqueda realizada.');
      }
      setCourts(response.data);
    } catch (error) {
      console.error('Error fetching courts:', error.response ? error.response.data : error.message);
      alert(`Error: ${error.response ? error.response.data.details : error.message}`);
    }
    setLoading(false);
  };

  const clearSelection = (setter) => {
    setter([]);
  };

  return (
    <AppContainer>
      <Title>Búsqueda de Canchas</Title>
      <Form onSubmit={handleSubmit}>
        <Label>
          Fecha inicial:
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Label>
        <Label>
          Recintos:
          <Select
            multiple
            value={selectedRecintos}
            onChange={(e) => setSelectedRecintos(Array.from(e.target.selectedOptions, option => option.value))}
          >
            {Object.entries(recintos).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </Select>
          <ClearButton type="button" onClick={() => clearSelection(setSelectedRecintos)}>Limpiar</ClearButton>
        </Label>
        <Label>
          Cantidad de dias a buscar:
          <Input
            type="number"
            min="1"
            value={daysToIterate}
            onChange={(e) => setDaysToIterate(parseInt(e.target.value))}
          />
        </Label>
        <Label>
          Canchas:
          <Select
            multiple
            value={selectedCanchas}
            onChange={(e) => setSelectedCanchas(Array.from(e.target.selectedOptions, option => option.value))}
          >
            {canchas.map((cancha) => (
              <option key={cancha} value={cancha}>{cancha}</option>
            ))}
          </Select>
          <ClearButton type="button" onClick={() => clearSelection(setSelectedCanchas)}>Limpiar</ClearButton>
        </Label>
        <Button type="submit">Buscar</Button>
      </Form>

      {loading ? (
        <p>Cargando...</p>
      ) : message ? (
        <p>{message}</p>
      ) : (
        courts.map((court, index) => (
          <CourtCard key={index}>
            <CourtTitle>{court.recintoName} ({court.recintoCode})</CourtTitle>
            <CourtInfo>Fecha: {court.date} ({court.dayOfWeek})</CourtInfo>
            <CourtInfo>Hora: {court.hour}</CourtInfo>
            <CourtInfo>Canchas: {court.canchas.join(', ')}</CourtInfo>
            <BookingLink href={court.bookingUrl} target="_blank" rel="noopener noreferrer">
              Reservar
            </BookingLink>
          </CourtCard>
        ))
      )}
    </AppContainer>
  );
}

export default App;