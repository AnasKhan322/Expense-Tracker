import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SIDE_MENU_DATA } from '../../utils/data';
import { UserContext } from '../../context/userContext';
import CharAvatar from '../Cards/CharAvatar';

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // If you also have a server logout endpoint, you can call it here.
    // await axiosInstance.post(API_PATHS.AUTH.LOGOUT).catch(() => {});
    localStorage.removeItem('token');     // don't nuke all of localStorage
    clearUser();
    navigate('/login', { replace: true });
  };

  const isLogoutItem = (item) =>
    item?.label === 'Logout' || item?.isLogout === true || item?.path === '/logout';

  const handleClick = (item) => {
    if (isLogoutItem(item)) {
      handleLogout();
      return;
    }
    if (item?.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20">
      {/* Profile */}
      <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt="Profile"
            className="w-20 h-20 bg-slate-400 rounded-full object-cover"
          />
        ) : (
          <CharAvatar
            fullName={user?.fullName}
            width="w-20"
            height="h-20"
            style="text-xl"
          />
        )}

        <h5 className="text-gray-950 font-medium leading-6">
          {user?.fullName || ''}
        </h5>
      </div>

      {/* Menu */}
      {SIDE_MENU_DATA.map((item, index) => {
        const active =
          activeMenu === item.label; // strict equality

        const base =
          'w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg mb-3 transition';
        const classes = active
          ? `${base} text-white bg-primary`
          : `${base} text-gray-800 hover:bg-gray-100`;

        return (
          <button
            key={`menu_${index}`}
            type="button"
            className={classes}
            onClick={() => handleClick(item)}
          >
            {item.icon && <item.icon className="text-xl" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default SideMenu;
