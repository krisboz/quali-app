import "../styles/SupplierSelector.scss";

const SupplierSelector = ({selectedSupplier, setSelectedSupplier}) => {
    const suppliers = ["Adoma", "Breuning", "Rösch", "Schofer", "Sisti"];


    return(
        <div className="supplier-buttons">
        {suppliers.map((supplier) => (
            <button 
                key={supplier} 
                onClick={() => setSelectedSupplier(selectedSupplier === supplier ? null : supplier)}
            >
                {supplier}
            </button>
        ))}
    </div>
    )

}

export default SupplierSelector;