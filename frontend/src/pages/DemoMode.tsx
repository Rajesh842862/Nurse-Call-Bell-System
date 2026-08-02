import NavBar from "../components/NavBar";
import useAlert from "../context/useAlert";

const DemoMode = () => {
  const { isUnlocked, enableAudio ,} = useAlert();
  
  

  {/* Check audio enabled */}
  if (!isUnlocked) {
    return (
      <div className="app-root h-screen ">
        <NavBar />
        <div className="idle-container  fade-animation">
          <div className="idle-text">
            AUDIO LOCKED
            <br />
            CLICK TO ENABLE ALERT
          </div>

          <button className="enable-btn" onClick={enableAudio}>
            ENABLE AUDIO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root h-screen ">
      <NavBar />


      
    </div>
  );
};

export default DemoMode;
