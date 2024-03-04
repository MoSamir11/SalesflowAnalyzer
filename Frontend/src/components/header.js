import $ from 'jquery';
function Navbar(){
	var sidebar = $('#sidebar');
	var main = $('.main');
	var videoCall = $('.videoCall');
	var controls = $('.controls');

	if (sidebar.hasClass('collapsed')) {
		main.addClass('fixed');
		videoCall.removeClass('videoCall-collapsed');
		controls.removeClass('controls-collapsed');
	} else {
		main.removeClass('fixed');
		videoCall.addClass('videoCall-collapsed');
		controls.addClass('controls-collapsed');
	}

	sidebar.toggleClass('collapsed');
}
function Header() {
  return (
    <header id="header" className="header">
           	 <nav className="navbar navbar-expand px-3 border-bottom">
                
                <button className="btn navbar-btn" type="button" data-bs-theme="dark" id="navbtn" onClick={() => Navbar()}>
                    <span className="navbar-toggler-icon"></span>
                </button>
				<div className="w-100"></div>

						    
				<a className="navbar-text mx-3 pr-2" href="#">
					<i className="bi bi-bell fs-5"></i>
				</a>

				<div className="navbar-profile mx-2">
						<div className="profile-img">
							<img src="images/image-1.png" />
						</div>
				</div>
            </nav>
    </header>
  );
}

export default Header;
