import { SketchPicker } from 'react-color';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
} from '@mui/material';

export default function ThinkBoardView() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [eraserSize, setEraserSize] = useState(10);
    const [shapes, setShapes] = useState([]);
    const [currentShape, setCurrentShape] = useState('free');
    const [penSize, setPenSize] = useState(2); // Size for pen
    const [shapeWidth, setShapeWidth] = useState(50); // Width for rectangle
    const [shapeHeight, setShapeHeight] = useState(50); // Height for rectangle
    const [circleDiameter, setCircleDiameter] = useState(50); // Diameter for circle
    const [startPos, setStartPos] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const startDrawing = (e) => {
        setIsDrawing(true);
        const ctx = canvasRef.current.getContext('2d');
        const { offsetX, offsetY } = e.nativeEvent;
        setStartPos({ x: offsetX, y: offsetY });
        ctx.beginPath();
        if (currentShape === 'eraser') {
            ctx.clearRect(offsetX - eraserSize / 2, offsetY - eraserSize / 2, eraserSize, eraserSize);
        } else {
            ctx.moveTo(offsetX, offsetY);
        }
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const ctx = canvasRef.current.getContext('2d');
        const { offsetX, offsetY } = e.nativeEvent;

        if (currentShape === 'free') {
            ctx.lineTo(offsetX, offsetY);
            ctx.strokeStyle = color;
            ctx.lineWidth = penSize; // Use pen size
            ctx.stroke();
        } else if (currentShape === 'eraser') {
            ctx.clearRect(offsetX - eraserSize / 2, offsetY - eraserSize / 2, eraserSize, eraserSize);
        }
    };

    const stopDrawing = (e) => {
        if (!isDrawing) return;


        setIsDrawing(false);

        if (currentShape !== 'free' && startPos) {
            let width = shapeWidth;
            let height = shapeHeight;
            const diameter = circleDiameter;
        
            if (currentShape === 'circle') {
                width = diameter;
                height = diameter;
            }
        
            drawShape(currentShape, startPos.x, startPos.y, width, height, color);
            setShapes((prevShapes) => [
                ...prevShapes,
                { shape: currentShape, x: startPos.x, y: startPos.y, width, height, color },
            ]);
        }
        
    };

    const drawShape = useCallback((shape, x, y, width, height, shapeColor) => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = shapeColor;
        ctx.lineWidth = 2;

        if (shape === 'rectangle') {
            ctx.strokeRect(x - width / 2, y - height / 2, width, height);
        } else if (shape === 'circle') {
            ctx.beginPath();
            ctx.arc(x, y, width / 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }, []);

    const clearCanvas = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setShapes([]);
    };

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        shapes.forEach(({ shape, x, y, width, height, color: shapeColor }) =>
            drawShape(shape, x, y, width, height, shapeColor)
        );
    }, [shapes, drawShape]);

    const handleColorChange = (newColor) => {
        setColor(newColor.hex);
    };

    const handleShapeChange = (shape) => {
        setCurrentShape(shape);
    };

    const handleColorPickerToggle = () => {
        setShowColorPicker(!showColorPicker);
    };

    return (
        <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" gutterBottom>
                ThinkBoard
            </Typography>

            <Box mb={2} display="flex" alignItems="center" justifyContent="center">
                <Box display="flex" gap={2}>
                    <Button onClick={() => handleShapeChange('free')} variant={currentShape === 'free' ? "contained" : "outlined"}>
                        ✏️ Pen
                    </Button>
                    <Button onClick={() => handleShapeChange('rectangle')} variant={currentShape === 'rectangle' ? "contained" : "outlined"}>
                        ⬜ Rectangle
                    </Button>
                    <Button onClick={() => handleShapeChange('circle')} variant={currentShape === 'circle' ? "contained" : "outlined"}>
                        ⚪ Circle
                    </Button>
                    <Button onClick={() => handleShapeChange('eraser')} variant={currentShape === 'eraser' ? "contained" : "outlined"}>
                        🧽 Eraser
                    </Button>
                </Box>

                <Button variant="contained" onClick={handleColorPickerToggle} sx={{ ml: 2 }}>
                    {showColorPicker ? "Hide Color Picker" : "Show Color Picker"}
                </Button>

                {showColorPicker && (
                    <SketchPicker color={color} onChange={handleColorChange} />
                )}

                <TextField
                    label="Color (Hex)"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    sx={{ ml: 2 }}
                />
                {currentShape === 'eraser' && (
                    <TextField
                        label="Eraser Size"
                        type="number"
                        value={eraserSize || ''}
                        onChange={(e) => setEraserSize(Number(e.target.value) || 0)}
                        sx={{ ml: 2 }}
                    />
                )}
                {currentShape === 'free' && (
                    <TextField
                        label="Pen Size"
                        type="number"
                        value={penSize || ''}
                        onChange={(e) => setPenSize(Number(e.target.value) || 0)}
                        sx={{ ml: 2 }}
                    />
                )}
                {currentShape === 'rectangle' && (
                    <>
                        <TextField
                            label="Width"
                            type="number"
                            value={shapeWidth || ''}
                            onChange={(e) => setShapeWidth(Number(e.target.value) || 0)}
                            sx={{ ml: 2 }}
                        />
                        <TextField
                            label="Height"
                            type="number"
                            value={shapeHeight || ''}
                            onChange={(e) => setShapeHeight(Number(e.target.value) || 0)}
                            sx={{ ml: 2 }}
                        />
                    </>
                )}
                {currentShape === 'circle' && (
                    <TextField
                        label="Diameter"
                        type="number"
                        value={circleDiameter || ''}
                        onChange={(e) => setCircleDiameter(Number(e.target.value) || 0)}
                        sx={{ ml: 2 }}
                    />
                )}

                <Button variant="contained" onClick={clearCanvas} sx={{ ml: 2 }}>
                    Clear
                </Button>
            </Box>

            <Box sx={{ border: '2px solid blue', width: '100%', maxWidth: '1200px', overflow: 'hidden' }}>
                <canvas
                    ref={canvasRef}
                    width={1200}
                    height={600}
                    style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={() => setIsDrawing(false)}
                />
            </Box>
        </Container>
    );
}