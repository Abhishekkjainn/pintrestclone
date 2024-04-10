import '../App.css';
import React, { useState, useEffect } from 'react';
import { imageDB } from '../../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';
import Popup from 'reactjs-popup';

export default function MainPage() {
  const [activeTag, setActiveTag] = useState('home');

  const handleTagClick = (tag) => {
    setActiveTag(tag);
  };

  return (
    <div className="MainPage">
      <HeaderMainPage activeTag={activeTag} handleTagClick={handleTagClick} />
      <MainScreenDecider activeTag={activeTag} />
    </div>
  );
}

function HeaderMainPage({ activeTag, handleTagClick }) {
  const usernameheader = localStorage.getItem('username');
  const useremailheader = localStorage.getItem('useremail');
  const userimageheader = localStorage.getItem('userphoto');

  return (
    <div className="Header">
      <div className="firstContainer">
        <div className="logo">
          <img
            src="pintrestlogo.png"
            alt="pintrestLogo"
            className="headerLogo"
          />
        </div>
        <div
          className={`tag ${activeTag === 'home' ? 'activetag' : ''}`}
          id="hometag"
          onClick={() => handleTagClick('home')}
        >
          Home
        </div>
        <div
          className={`tag ${activeTag === 'explore' ? 'activetag' : ''}`}
          id="Exploretag"
          onClick={() => handleTagClick('explore')}
        >
          Explore
        </div>
        <div
          className={`tag ${activeTag === 'create' ? 'activetag' : ''}`}
          id="Createtag"
          onClick={() => handleTagClick('create')}
        >
          Create
        </div>
      </div>
      <div className="secondContainer">
        <input
          type="text"
          name="search"
          id="Searchbar"
          className="searchBar"
          placeholder="Search"
        />
      </div>
      <div className="thirdContainer">
        <div className="notification">
          <img
            src="notification.png"
            alt="notification"
            className="thirdsectionimage"
          />
        </div>
        <div className="notification">
          <img
            src="chat.png"
            alt="notification"
            className="thirdsectionimage"
          />
        </div>
        <div className="userprofileimage">
          <img
            src={userimageheader}
            alt="userimage"
            className="userprofileimage"
          />
        </div>
        <div className="notification">
          <img src="down.png" alt="notification" className="downarrow" />
        </div>
      </div>
    </div>
  );
}

function MainScreenDecider({ activeTag }) {
  return activeTag === 'home' ? (
    <HomePage />
  ) : activeTag === 'explore' ? (
    <ExplorePage />
  ) : (
    <CreatePage />
  );
}

function HomePage() {
  const [items, setItems] = useState([]);

  const dummyData = [
    { id: 1, text: 'Item 1', height: 200 },
    { id: 2, text: 'Item 2', height: 150 },
    { id: 3, text: 'Item 3', height: 270 },
    { id: 4, text: 'Item 4', height: 180 },
    { id: 5, text: 'Item 5', height: 220 },
    { id: 6, text: 'Item 6', height: 190 },
    { id: 7, text: 'Item 7', height: 210 },
    { id: 8, text: 'Item 8', height: 240 },
    { id: 9, text: 'Item 9', height: 170 },
    { id: 10, text: 'Item 10', height: 200 },
  ];

  useEffect(() => {
    setItems(dummyData);
  }, []);

  // Calculate column heights
  const columns = [[], [], [], [], [], []]; // Initialize empty columns
  items.forEach((item, index) => {
    const shortestColumnIndex = columns.reduce(
      (acc, col, idx) => (col.length < columns[acc].length ? idx : acc),
      0
    );
    columns[shortestColumnIndex].push(item);
  });

  return (
    <div className="homepage">
      {columns.map((column, index) => (
        <div key={index} className="column">
          {column.map((item) => (
            <div
              key={item.id}
              className="imagediv"
              style={{ height: `${item.height}px` }}
            >
              {item.text}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ExplorePage() {
  return <div>Explorepage</div>;
}

/*Complete Create Page*/
let downloadUrl = '';

function CreatePage() {
  const [selectedImage, setSelectedImage] = useState(null);

  var placeholderimage =
    'https://img.freepik.com/premium-vector/photo-icon-picture-icon-image-sign-symbol-vector-illustration_64749-4409.jpg?size=338&ext=jpg&ga=GA1.1.1700460183.1712620800&semt=sph';

  // var placeholderimage =
  //   'https://firebasestorage.googleapis.com/v0/b/pintrest-clone-f43f5.appspot.com/o/files%2Fautomatevellore%40gmail.com_1cf7dde8-e9b8-4121-8729-7bb6c1537f3e?alt=media&token=fe0c82ae-9f51-43bc-b92d-e6e020f490d2';

  const uploadImageToStorage = async (file) => {
    try {
      // Create a reference to the storage location
      const storageRef = ref(
        imageDB,
        `files/${localStorage.getItem('useremail')}_${uuidv4()}`
      );

      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, file);

      // Get the download URL of the uploaded file
      const url = await getDownloadURL(storageRef);

      // Save the download URL to the global variable
      downloadUrl = url;

      // Return the download URL
      console.log(url);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null; // Return null in case of error
    }
  };
  // Function to handle file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0]; // Get the first selected file
    if (file) {
      const reader = new FileReader(); // Create a FileReader object
      reader.onload = async () => {
        setSelectedImage(reader.result); // Set the selected image URL
        const imageUrl = await uploadImageToStorage(file);
        console.log('Download URL:', imageUrl);
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  const storeDataInFirestore = async (
    title,
    description,
    link,
    imageUrl,
    displayName,
    email
  ) => {
    try {
      // Reference to the Firestore collection
      const firestoreCollection = collection(firestore, 'posts');

      // Add a new document with the provided data
      const docRef = await addDoc(firestoreCollection, {
        title: title,
        description: description,
        link: link,
        imageUrl: imageUrl,
        displayName: displayName,
        email: email,
      });

      // Log the document ID
      console.log('Document written with ID: ', docRef.id);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  // Function to handle publishing
  const handlePublish = async () => {
    // Get other data needed for Firestore document
    var title = document.getElementById('title').value;
    var description = document.getElementById('description').value;
    var link = document.getElementById('link').value;
    var email = localStorage.getItem('useremail');
    var displayName = localStorage.getItem('username');

    if (downloadUrl != '' && title != '' && description != '' && link != '') {
      await storeDataInFirestore(
        title,
        description,
        link,
        downloadUrl,
        displayName,
        email
      )
        .then(() => {
          // Clear input fields after successful upload
          document.getElementById('title').value = '';
          document.getElementById('description').value = '';
          document.getElementById('link').value = '';
          setSelectedImage(null);
          downloadUrl = ''; // Reset download URL
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.error('Insufficient Data here to Upload.');
    }
  };

  return (
    <div className="createpage">
      <div className="createpinhead">
        <div className="headtext">Create Pin</div>
        <div className="publishbutton" onClick={handlePublish}>
          Publish
        </div>
      </div>

      <div className="uploaddiv">
        <div className="uploadimagediv">
          {/* Display the selected image */}
          {selectedImage && (
            <div className="displaydiv">
              <img
                src={selectedImage}
                alt="Selected"
                style={{
                  maxWidth: '60%',
                  maxHeight: '450px',
                  borderRadius: '20px',
                  marginBottom: '30px',
                }}
              />
            </div>
          )}
          {/* Display a placeholder image if no image is selected */}
          {!selectedImage && (
            <div>
              <img
                src={placeholderimage}
                alt="Placeholder"
                style={{
                  maxWidth: '100%',
                  // maxHeight: '450px',
                  borderRadius: '20px',
                  marginBottom: '30px',
                }}
              />
            </div>
          )}
          {/* File input element */}
          <input
            type="file"
            accept="image/*" // Allow only image files
            onChange={handleFileChange} // Call handleFileChange function when a file is selected
          />
        </div>

        <div className="uploaddetailsdiv">
          <div className="input-group title">
            <label className="label">Title</label>
            <input
              autoComplete="off"
              name="Email"
              id="title"
              className="input"
              type="text"
            />
            <div></div>
          </div>
          <div className="input-group title">
            <label className="label">Description</label>
            <textarea
              autoComplete="off"
              name="Email"
              id="description"
              className="input"
              type="text"
              draggable
            />
            <div></div>
          </div>
          <div className="input-group title">
            <label className="label">Link</label>
            <input
              autoComplete="off"
              name="Email"
              id="link"
              className="input"
              type="text"
            />
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
