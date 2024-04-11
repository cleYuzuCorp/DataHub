import { useState } from 'react';
import { Container, Button } from "@mui/material";

const Form = () => {
    const [file, setFile] = useState<File>();

    const handleDragOver = (event: any) => {
        event.preventDefault();
    };

    const handleDrop = (event: any) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];
        setFile(droppedFile);
    };

    const handleUpload = async () => {
        try {
            if (!file) {
                console.error('No file selected');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            const url = 'http://127.0.0.1:7071/api/drop-contact-parser';

            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleFileChange = (event: any) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        setFile(selectedFile);
    };


    return (
        <Container
            maxWidth="lg"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{ border: '2px dashed #ccc', padding: '20px', borderRadius: '10px', textAlign: 'center' }}
        >
            <p>Drag and drop your Excel file here, or click to select</p>
            <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="fileInput"
            />
            <label htmlFor="fileInput">
                <Button variant="contained" component="span">
                    Select File
                </Button>
            </label>
            {file && (
                <div style={{ marginTop: '20px' }}>
                    <p>Selected file: {file.name}</p>
                </div>
            )}
            <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!file}
                style={{ marginTop: '20px' }}
            >
                Upload
            </Button>
        </Container>
    );
};

export default Form;