

function OptionsView(props) {

    return (
        <div
            style={{
                    position: 'fixed',
                    top: props.position.top,
                    bottom: props.position.bottom,
                    left: props.position.left,
                    right: props.position.right,
                    zIndex: 1000,
                    // width: `${window.innerWidth / 4}px`,
                    borderRadius: '10px',
                    outline: "1px solid white",
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                }}
            >
                
           {props.content}
        </div>
    );
};

export default OptionsView;