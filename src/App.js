import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Global Styles for Light and Dark Themes
const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${({ theme }) => (theme === 'dark' ? '#1c1c1c' : '#ffffff')};
    color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : '#000000')};
  }
`;

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : '#333')};
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
  background-color: ${({ theme }) => (theme === 'dark' ? '#333' : '#f0f0f0')};
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
`;

const CourtInfo = styled.div`
  flex: 1;
`;

const CourtTitle = styled.h2`
  color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : '#2c3e50')};
  margin-bottom: 10px;
`;

const CourtText = styled.p`
  margin: 5px 0;
  color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : '#34495e')};
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

const CourtIcons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  align-items: flex-start;
  max-width: 120px;
`;

const CourtIconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CourtNumber = styled.span`
  font-size: 12px;
  margin-top: 2px;
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

const ThemeToggleButton = styled.label`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;

  input {
    display: none;
  }
`;

const ToggleSwitch = styled.span`
  width: 60px;
  height: 30px;
  background: ${({ theme }) => (theme === 'dark' ? '#555' : '#3498db')};
  border-radius: 15px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;

  &::before {
    content: '';
    position: absolute;
    width: 26px;
    height: 26px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: ${({ theme }) => (theme === 'dark' ? '32px' : '2px')};
    transition: left 0.2s;
  }
`;

const canchas = ["Cancha Tenis 1", "Cancha Tenis 2", "Cancha Tenis 3", "Cancha Tenis 4"];
const recintos = {
  804: "Germán Becker",
  855: "Labranza"
};

// Icono de Cancha de Tenis actualizado y más realista
const TennisCourtIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" fill="#88C540"/>
    <rect x="1" y="1" width="22" height="22" fill="#9ACD32"/>
    <rect x="2" y="2" width="20" height="20" stroke="#FFFFFF" strokeWidth="0.5"/>
    <line x1="12" y1="2" x2="12" y2="22" stroke="#FFFFFF" strokeWidth="0.5"/>
    <line x1="2" y1="12" x2="22" y2="12" stroke="#FFFFFF" strokeWidth="0.5"/>
    <rect x="2" y="7" width="20" height="10" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="1 0.5"/>
    <rect x="7" y="2" width="10" height="20" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="1 0.5"/>
    <rect x="11.75" y="2" width="0.5" height="20" fill="#FFFFFF"/>
    <ellipse cx="12" cy="12" rx="1" ry="0.5" fill="#FFFFFF"/>
    <path d="M2 2 L7 7 M17 7 L22 2 M2 22 L7 17 M17 17 L22 22" stroke="#FFFFFF" strokeWidth="0.5"/>
  </svg>
);

function App() {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedRecintos, setSelectedRecintos] = useState([]);
  const [selectedCanchas, setSelectedCanchas] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState('light');

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
      const response = await axios.post('https://reserva-node-production.up.railway.app/courts', {
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

  const getCourtNumber = (canchaName) => {
    const match = canchaName.match(/\d+$/);
    return match ? match[0] : '';
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <AppContainer>
      <GlobalStyle theme={theme} />
      <ThemeToggleButton>
        <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
        <ToggleSwitch theme={theme} />
      </ThemeToggleButton>
      <Title theme={theme}>Búsqueda de Canchas</Title>
      <Form onSubmit={handleSubmit}>
        <Label>
          Recintos:
          <Select multiple value={selectedRecintos} onChange={(e) => setSelectedRecintos(Array.from(e.target.selectedOptions, option => option.value))}>
            {Object.entries(recintos).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </Select>
        </Label>
        <Label>
          Canchas:
          <Select multiple value={selectedCanchas} onChange={(e) => setSelectedCanchas(Array.from(e.target.selectedOptions, option => option.value))}>
            {canchas.map((cancha, index) => (
              <option key={index} value={cancha}>{cancha}</option>
            ))}
          </Select>
        </Label>
        <Label>
          Rango de fechas:
          <StyledDatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable={true}
            placeholderText="Seleccione un rango de fechas"
            dateFormat="dd/MM/yyyy"
          />
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
          <CourtCard key={index} theme={theme}>
            <CourtInfo>
              <CourtTitle theme={theme}>{court.recintoName} ({court.recintoCode})</CourtTitle>
              <CourtText theme={theme}>Fecha: {court.date} ({court.dayOfWeek})</CourtText>
              <CourtText theme={theme}>Hora: {court.hour}</CourtText>
              <CourtText theme={theme}>Canchas: {court.canchas.join(', ')}</CourtText>
              <BookingLink href={court.bookingUrl} target="_blank" rel="noopener noreferrer">
                Reservar
              </BookingLink>
            </CourtInfo>
            <CourtIcons>
              {court.canchas.map((cancha, idx) => (
                <CourtIconWrapper key={idx}>
                  <TennisCourtIcon />
                  <CourtNumber>{getCourtNumber(cancha)}</CourtNumber>
                </CourtIconWrapper>
              ))}
            </CourtIcons>
          </CourtCard>
        ))
      )}
    </AppContainer>
  );
}

export default App;
