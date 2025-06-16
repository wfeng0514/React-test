import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '20px',
  maxWidth: '600px',
  margin: '0 auto',
});

export const Section = styled('div')({
  margin: '30px 0',
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '5px',
});

export const Button = styled('button')({
  padding: '8px 15px',
  background: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginRight: '10px',
  '&:disabled': {
    background: '#cccccc',
    cursor: 'not-allowed',
  },
});

export const DownloadButton = styled('a')({
  display: 'inline-block',
  padding: '8px 15px',
  background: '#2196F3',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '4px',
});

export const ProgressContainer = styled('div')({
  marginTop: '15px',
});

export const ResultContainer = styled('div')({
  marginTop: '15px',
  padding: '10px',
  background: '#f0f0f0',
  borderRadius: '5px',
});
