"use client";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation"; // Import Next.js router
import Image from "next/image";

export default function HomePage() {
    interface StockItem {
        PatternNo: string;
        Quantity: number;
        Section: string;
        Type: string;
        Colour: string;
        Tag: string;
        Price: number;
        Repeat: string;
        Company: string;
        ImageURL: string;
        InstallationURL: string;
    }
    const [stock, setStock] = useState<StockItem[]>([]);
    const [filteredStock, setFilteredStock] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
    const [editedStock, setEditedStock] = useState<Record<string, Partial<StockItem>>>({});
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchCategory, setSearchCategory] = useState("PatternNo");
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showColumnMenu, setShowColumnMenu] = useState(false);    
    const [visibleColumns, setVisibleColumns] = useState<string[]>(["PatternNo", "Quantity", "Section"]);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [addInProgress, setAddInProgress] = useState(false); // Add this at the top
    const [newStock, setNewStock] = useState({
        PatternNo: "",
        Quantity: "",
        Section: "",
        Type: "",
        Colour: "",
        Tag: "",
        Price: "",
        Repeat: "",
        Company: ""
    });


    useEffect(() => {
        if (status === "unauthenticated") {
            signOut({ redirect: false }).then(() => {
                setTimeout(() => {
                    router.push("/");
                }, 500); // Add a slight delay before redirect
            });
        }
    }, [status, router]);    

    useEffect(() => {
        if (status === "authenticated") {
            fetch("/api/get-stock")
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                    } else {
                        setStock(data);
                        setFilteredStock(data);
                    }
                    setLoading(false);
                })
                .catch(() => {
                    setError("Failed to fetch stock data.");
                    setLoading(false);
                });
        }
    }, [status]);

    useEffect(() => {
        const filtered = stock.filter((item) => {
            const value = item[searchCategory as keyof StockItem];
        
            if (typeof value === "number") {
                return value.toString().toLowerCase().includes(searchQuery.toLowerCase());
            }
        
            return value?.toLowerCase().includes(searchQuery.toLowerCase());
        });
        setFilteredStock(filtered);
    }, [searchQuery, searchCategory, stock]);

    if (status === "loading") {
        return <p>Loading...</p>;
    }    
    const allColumns = [
        "PatternNo",
        "Quantity",
        "Section",
        "Type",
        "Colour",
        "Tag",
        "Price",
        "Repeat",
        "Company",
        "ImageURL",
        "InstallationURL"
    ];

    // Toggle column selection
    const handleColumnChange = (column: string) => {
        setVisibleColumns(prevColumns =>
            prevColumns.includes(column)
                ? prevColumns.filter(c => c !== column)
                : [...prevColumns, column]
        );
    };

    const openAddPopup = () => {
        setNewStock({
            PatternNo: "",
            Quantity: "",
            Section: "",
            Type: "",
            Colour: "",
            Tag: "",
            Price: "",
            Repeat: "",
            Company: ""
        });
        setShowAddPopup(true);
    };

    const styles: { [key: string]: React.CSSProperties } = {
        th: { border: "1px solid #ddd", padding: "8px", textAlign: "left", fontWeight: "bold", backgroundColor: "#f4f4f4", cursor: "pointer" },
        td: { border: "1px solid #ddd", padding: "8px", textAlign: "left" },
        rowEven: { backgroundColor: "#f9f9f9" },
        rowOdd: { backgroundColor: "#ffffff" },
        searchContainer: { display: "flex", gap: "10px", marginBottom: "10px" },
        searchInput: { padding: "8px", border: "1px solid #ddd", borderRadius: "4px", flex: "1" },
        selectInput: { padding: "8px", border: "1px solid #ddd", borderRadius: "4px" },
        imageThumbnail: { width: "50px", height: "50px", objectFit: "cover", cursor: "pointer" },
        popupOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.7)", display: "flex", alignItems: "center", justifyContent: "center" },
        popupImage: { maxWidth: "90vw", maxHeight: "90vh" },
        columnMenu: { position: "absolute", background: "white", border: "1px solid #ddd", padding: "10px", borderRadius: "5px", zIndex: 10 }
    };

    function renderSafeHTML(content: string) {
        return { __html: DOMPurify.sanitize(content) };
    }

    const sortStock = (key: string) => {
        if (!visibleColumns.includes(key)) return; // ✅ Prevent sorting hidden columns

        let direction: "asc" | "desc" = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        
        const sortedStock = [...filteredStock].sort((a, b) => {
            const aValue = a[key as keyof StockItem];
            const bValue = b[key as keyof StockItem];
        
            if (typeof aValue === "number" && typeof bValue === "number") {
                return direction === "asc" ? aValue - bValue : bValue - aValue;
            }
        
            return direction === "asc"
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
        });
        

        setFilteredStock(sortedStock);
        setSortConfig({ key, direction });
    };

    const handleAddStock = async () => {
        if (addInProgress) return; // Prevent double submit
        if (!newStock.PatternNo || newStock.PatternNo.trim() === "") {
          alert("PatternNo is required.");
          return;
        }
      
        // ✅ Prevent duplicate PatternNo
        const exists = stock.some(item => item.PatternNo === newStock.PatternNo);
        if (exists) {
          alert("A stock with the same PatternNo already exists.");
          return;
        }
      
        const quantity = parseFloat(newStock.Quantity);
        const price = parseFloat(newStock.Price);
      
        if (isNaN(quantity) || isNaN(price)) {
          alert("Quantity and Price must be valid numbers.");
          return;
        }
      
        setAddInProgress(true); // 🔒 Lock the add button
      
        const parsedStock = {
          ...newStock,
          Quantity: quantity,
          Price: price
        };
      
        const sorted = [...stock].sort((a, b) => a.PatternNo.localeCompare(b.PatternNo));
        const insertIndex = sorted.findIndex(item => item.PatternNo > newStock.PatternNo) + 2;
      
        try {
          const response = await fetch("/api/add-stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ row: insertIndex, newStock: parsedStock })
          });
      
          const result = await response.json();
          if (result.error) {
            alert("Failed to add stock: " + result.error);
          } else {
            alert("Stock added successfully!");
            setShowAddPopup(false);
            setStock((prev) => {
              const updated = [...prev, { ...parsedStock, ImageURL: "", InstallationURL: "" }];
              updated.sort((a, b) => a.PatternNo.localeCompare(b.PatternNo));
              return updated;
            });
            setFilteredStock((prev) => {
              const updated = [...prev, { ...parsedStock, ImageURL: "", InstallationURL: "" }];
              updated.sort((a, b) => a.PatternNo.localeCompare(b.PatternNo));
              return updated;
            });
          }
        } catch {
          alert("Failed to add stock. Please try again.");
        } finally {
          setAddInProgress(false); // 🔓 Unlock regardless of outcome
        }
      };
    

    return (
        <div style={{ padding: "20px" }}>
            <h1>Stock Inventory</h1>
            <p>Welcome, {session?.user?.email}</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <button onClick={() => signOut()}>Sign out</button>
                <button onClick={openAddPopup}>+ Add Stock</button>
                </div>
            <div style={{ marginBottom: "10px" }}>
                <button onClick={() => setShowColumnMenu(!showColumnMenu)}>Show Columns</button>
                {showColumnMenu && (
                    <div style={{
                        position: "absolute", background: "white", border: "1px solid #ddd",
                        padding: "10px", borderRadius: "5px", zIndex: 10
                    }}>
                        {allColumns.map(column => (
                            <label key={column} style={{ display: "block" }}>
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.includes(column)}
                                    onChange={() => handleColumnChange(column)}
                                />{" "}
                                {column}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div style={styles.searchContainer}>
                <select
                    style={styles.selectInput}
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                >
                    {filteredStock.length > 0 &&
                        Object.keys(filteredStock[0]).map((key) => (
                            <option key={key} value={key}>{key}</option>
                        ))}
                </select>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                />
            </div>
            {showAddPopup && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "white", padding: 20, borderRadius: 8 }}>
                        <h2>Add New Stock</h2>
                        {Object.keys(newStock).map((key) => (
                            <div key={key} style={{ marginBottom: 10 }}>
                                <label>{key}</label>
                                <input
                                    type="text"
                                    value={newStock[key as keyof typeof newStock] as string}
                                    onChange={(e) => setNewStock(prev => ({
                                        ...prev,
                                        [key]: e.target.value
                                    }))}
                                />
                            </div>
                        ))}
                        <button onClick={handleAddStock} disabled={addInProgress}>
                            {addInProgress ? "Adding..." : "Add"}
                        </button>
                        <button onClick={() => setShowAddPopup(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {loading ? (
                <p>Loading stock data...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <div style={{ overflowX: "auto", maxWidth: "100%" }}> 
                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white">
                                {visibleColumns.map((key) => (
                                    <th key={key} onClick={() => sortStock(key)}>
                                        {key} {sortConfig?.key === key ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStock.map((item) => (
                                <tr 
                                    key={item.PatternNo} 
                                    className="even:bg-white odd:bg-gray-50 dark:even:bg-[#1a1a1a] dark:odd:bg-[#111]"
                                >
                                    {visibleColumns.map((key) => (
                                        <td key={key} className="text-black dark:text-white">
                                            {key === "ImageURL" ? (
                                                <Image 
                                                    src={item[key as keyof StockItem] as string}
                                                    alt="Thumbnail"
                                                    width={50}
                                                    height={50}
                                                    style={{ objectFit: "cover", cursor: "pointer" }}
                                                />
                                            ) : editMode[item.PatternNo] && key !== "PatternNo" ? (
                                                <input
                                                    type="text"
                                                    value={editedStock[item.PatternNo]?.[key as keyof StockItem] !== undefined
                                                        ? String(editedStock[item.PatternNo]?.[key as keyof StockItem])
                                                        : String(item[key as keyof StockItem])
                                                    }
                                                    onChange={(e) => handleInputChange(item.PatternNo, key, e.target.value)}
                                                />
                                            ) : (
                                                <div dangerouslySetInnerHTML={renderSafeHTML(String(item[key as keyof StockItem]))} />
                                            )}
                                        </td>
                                    ))}
                                    <td>
                                    <button
                                        className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-2 py-1 rounded"
                                        onClick={() => toggleEdit(item.PatternNo)}
                                    >
                                        {editMode[item.PatternNo] ? "Save" : "Edit"}
                                    </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                </div>
            )}
            {selectedImage && (
                <div style={styles.popupOverlay} onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Full Size" style={styles.popupImage} />
                </div>
            )}
        </div>
    );

    function handleInputChange(patternNo: string, field: string, value: string) {
        setEditedStock((prevStock) => ({
            ...prevStock,
            [patternNo]: { ...prevStock[patternNo], [field]: value },
        }));
    }

    function toggleEdit(patternNo: string) {
        setEditMode((prev) => ({
            ...prev,
            [patternNo]: !prev[patternNo],
        }));

        if (!editMode[patternNo]) {
            setEditedStock((prev) => ({
                ...prev,
                [patternNo]: { ...stock.find(item => item.PatternNo === patternNo) },
            }));
        } else {
            saveStock(patternNo);
        }
    }

    function saveStock(patternNo: string) {
        const product = editedStock[patternNo];
        if (!product) return;

        setLoading(false);

        fetch("/api/update-stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ PatternNo: patternNo, updates: product }),
        })
            .then((res) => res.json())
            .then((data) => {
                setLoading(false);

                if (data.error) {
                    alert("Error updating stock: " + data.error);
                } else {
                    alert("Stock updated successfully!");
                    setStock((prevStock) =>
                        prevStock.map((item) =>
                            item.PatternNo === patternNo ? { ...item, ...product } : item
                        )
                    );
                    setEditedStock((prev) => {
                        const updatedState = { ...prev };
                        delete updatedState[patternNo];
                        return updatedState;
                    });
                    setEditMode((prev) => ({
                        ...prev,
                        [patternNo]: false,
                    }));
                }
            })
            .catch(() => {
                setLoading(false);
                alert("Failed to update stock.");
            });
    }
}