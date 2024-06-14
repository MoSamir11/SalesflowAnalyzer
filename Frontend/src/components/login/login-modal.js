import {React, useEffect, useState} from 'react';
import $ from 'jquery';
const LoginModal = () =>{
    // useEffect(()=>{
    //     $('#exampleModal2').modal('show');
    // })
    const [popup, setPopUp] = useState("close");
    const open = () =>{
        switch(popup){
            case "close":
                setPopUp("open");
                return;
            case "open":
                setPopUp("close");
                return;
            default:
                setPopUp("close");
                return;
        }
    }

    return(
        <div className="modal fade" id="exampleModal2" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
				<div className="modal-dialog modal-dialog-centered">
					<div className="modal-content">
					<div className="modal-header">
						<h1 className="modal-title fs-5" id="exampleModalLabel"></h1>
						<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div className="modal-body">
						<div className="text-center pt-3">
						<h2>Client has Joined</h2>
						</div>
						<div className="row pt-3">
						<div className="col-lg-12 col-md-12 col-sm-12 d-flex justify-content-center user">
							<i className="bi bi-person-circle text-secondary"></i>
						</div>
						</div>
						<div className="row pt-5">
						<div className="col-lg-6 col-md-6 col-sm-6 d-flex justify-content-center">
							<button type="button" className="btn text-white bg-success" data-bs-dismiss="modal">
							Call
						</button>
						</div>
						<div className="col-lg-6 col-md-6 col-sm-6 d-flex justify-content-center">
							<button type="button" className="btn text-white bg-danger" data-bs-dismiss="modal">
							Reject Call
						</button>
						</div>
						</div>
					</div>
					</div>
				</div>
		</div>
    )
}

export default LoginModal