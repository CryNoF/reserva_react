import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CenterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const StyledDatePicker = styled(DatePicker)`
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100%;
`;

const canchas = ["Cancha Tenis 1", "Cancha Tenis 2", "Cancha Tenis 3", "Cancha Tenis 4"];
const recintos = {
  804: "Germán Becker",
  855: "Labranza"
};

function App() {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedRecintos, setSelectedRecintos] = useState([]);
  const [selectedCanchas, setSelectedCanchas] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const calculateDaysBetween = (start, end) => {
    if (!start || !end) return 0;
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('Por favor, seleccione un rango de fechas');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const daysToIterate = calculateDaysBetween(startDate, endDate);
      console.log('Sending request with data:', { startDate, endDate, selectedRecintos, daysToIterate, selectedCanchas });
      const response = await axios.post('https://reserva-node.onrender.com/courts', {
        startDate: startDate.toISOString().split('T')[0],
        selectedRecintos,
        daysToIterate,
        selectedCanchas,
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

  const formatCanchaName = (cancha, recintoCode) => {
    if (recintoCode === '855') { // Labranza
      return cancha.replace("Cancha Tenis", "Cancha de Tenis");
    }
    return cancha;
  };

  return (
    <AppContainer>
      <Title>Búsqueda de Canchas</Title>
      <Form onSubmit={handleSubmit}>
        <Label>
          Rango de fechas:
          <StyledDatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              setDateRange(update);
            }}
            isClearable={true}
            placeholderText="Seleccione rango de fechas"
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
        </Label>
        <Button type="submit">Buscar</Button>
      </Form>

      {loading ? (
        <CenterContainer>
          <Spinner />
        </CenterContainer>
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