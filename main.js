import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAEqowcf_n6iuVD1RR2DeFffHqWSMZl88M",
    authDomain: "wholesalepro-433db.firebaseapp.com",
    projectId: "wholesalepro-433db",
    storageBucket: "wholesalepro-433db.firebasestorage.app",
    messagingSenderId: "922966102079",
    appId: "1:922966102079:web:6274b4ef6eb2e626ad288a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



// --- Login Logic ---
document.getElementById("login-btn").addEventListener("click", async () => {
    const agentId = document.getElementById("agent-id").value.trim();
    const agentPassword = document.getElementById("login-password").value.trim();
    const errorEl = document.getElementById("login-error");

    if (!agentId || !agentPassword) {
        errorEl.textContent = "Please fill in both fields.";
        return;
    }

    try {
        const agentRef = doc(db, "agents", agentId);
        const agentSnap = await getDoc(agentRef);

        if (!agentSnap.exists()) {
            errorEl.textContent = "Invalid Agent ID.";
        } else {
            const agentData = agentSnap.data();
            if (agentData.password === agentPassword) {
                document.getElementById("login-page").style.display = "none";
                document.getElementById("main-page").style.display = "block";
                errorEl.textContent = "";
            } else {
                errorEl.textContent = "Incorrect password.";
            }
        }
    } catch (err) {
        console.error("Login error:", err);
        errorEl.textContent = "Error during login. Try again.";
    }
});


const productList = document.getElementById("product-list");
const addBtn = document.getElementById("add-product");

addBtn.addEventListener("click", () => {
    const div = document.createElement("div");
    div.className = "product-entry";
    div.innerHTML = `
        <input type="text" placeholder="Product Name" class="productName" required />
        <input type="number" placeholder="Retail Price" class="retailPrice" required />
        <input type="number" placeholder="Wholesale Price" class="wholesalePrice" required />
        <input type="number" placeholder="Monthly Demand" class="monthlyDemand" required />
        <input type="text" placeholder="Availability (e.g., Always/Sometimes)" class="availability" />
        <input type="number" placeholder="Competitor Price" class="competitorPrice" />
        <button type="button" class="remove-product">Remove</button>
      `;

    div.querySelector(".remove-product").addEventListener("click", () => {
        div.remove();
    });

    productList.appendChild(div);
});

document.getElementById("main-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const shopName = document.getElementById("shopName").value.trim();
    const shopkeeperName = document.getElementById("shopkeeperName").value.trim();
    const shopkeeperPhone = document.getElementById("shopkeeperPhone").value.trim();

    const productElements = document.querySelectorAll(".product-entry");
    if (productElements.length === 0) {
        document.getElementById("status").textContent = "❌ Please add at least one product.";
        return;
    }

    const products = [];
    productElements.forEach(el => {
        products.push({
            productName: el.querySelector(".productName").value.trim(),
            retailPrice: parseFloat(el.querySelector(".retailPrice").value),
            wholesalePrice: parseFloat(el.querySelector(".wholesalePrice").value),
            monthlyDemand: parseInt(el.querySelector(".monthlyDemand").value),
            availability: el.querySelector(".availability").value.trim(),
            competitorPrice: parseFloat(el.querySelector(".competitorPrice").value) || null
        });
    });

    try {
        await addDoc(collection(db, "marketSurveys"), {
            shopName,
            shopkeeperName,
            shopkeeperPhone,
            products,
            timestamp: serverTimestamp()
        });
        document.getElementById("status").textContent = "✅ Survey submitted!";
        document.getElementById("main-form").reset();
        productList.innerHTML = "";
    } catch (err) {
        console.error(err);
        document.getElementById("status").textContent = "❌ Failed to submit survey.";
    }
});