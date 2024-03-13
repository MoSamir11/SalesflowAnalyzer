

export const Header = () =>{
    return(
            <header id="header" class="header">
                <nav class="navbar navbar-expand px-2 border-bottom">
                  {/* <button
                    class="btn navbar-btn"
                    type="button"
                    data-bs-theme="dark"
                  >
                    <span class="navbar-toggler-icon"></span>
                  </button>{" "} */}
                  &nbsp;
                  <div className="index-logo p-2">
              <a href="#">
                magic<span>CX</span>
              </a>
            </div>
                  <div class="w-100"></div>
                  {/* <a class="navbar-text mx-3" href="#">
                    <i class="bi bi-gear fs-5"></i>
                  </a>
                  <a class="navbar-text mx-3 pr-1 position-relative" href="#">
                    <i class="bi bi-bell fs-5 position-relative">
                      <span
                        class="badge bg-danger rounded-circle position-absolute top-0 end-0 translate-middle"
                        style={{
                          width: "10px",
                          height: "10px",
                          transform: "translate(-50%, -50%)",
                        }}
                      ></span>
                    </i>
                  </a> */}
                  {/* <div class="navbar-profile mx-2">
                    <div class="profile-img">
                      <span role="button">WK</span>
                    </div>
                  </div> */}
                </nav>
              </header>
    )
}