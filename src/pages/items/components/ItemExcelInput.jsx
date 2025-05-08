import {useState} from 'react';
import * as XLSX from 'xlsx';
//import { submitAuswertungData } from '../api/api';
import { toast } from 'react-toastify';
import { uploadItems } from '../../../api/items';

//Styles are in the Items.scss

const ItemExcelInput = ({setItems, toggleFunction}) => {
  const [data, setData] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet);

      setData(sheetData);
      setItems(sheetData)
    };

    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    console.log("ADD SUBMIT AND BACKEND", {data})
      if (data) {
        try {
            await uploadItems(data);
            // Optionally clear the data state or show a success message
            setData(null);
            toast.success("Items table successfully uploaded!")
        } catch (error) {
            console.error('Error submitting data:', error);
            // Handle the error, e.g., show an error message to the user
            toast.error(`Error submitting data: ${error.message}`)
        }
    }
     
 
};

  return (
    <div>
    <input type="file" onChange={handleFileUpload} />
    <button onClick={handleSubmit} disabled={!data}>
        Submit
    </button>
    <button className='close-button' onClick={toggleFunction} >
        X
    </button>
</div>
  );
}

export default ItemExcelInput;