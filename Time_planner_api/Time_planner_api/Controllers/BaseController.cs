using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Time_planner_api.Controllers
{
    [ApiController]
    public abstract class BaseController : ControllerBase
    {
        public string GetUserId()
        {
            var claim = ((ClaimsIdentity)User.Identity).Claims.FirstOrDefault(claim => claim.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
            if (claim == null)
                return null;
            return claim.Value;
        }
    }
}
