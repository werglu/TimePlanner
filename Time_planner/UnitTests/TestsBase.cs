using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Time_planner_api.Controllers;
using Time_planner_api.Models;
using Xunit;

namespace UnitTests
{
    public class TestsBase
    {
        public void AddUserClaim(BaseController controller, string userId)
        {
            var contextMock = new Mock<HttpContext>();
            contextMock.Setup(x => x.User).Returns(new ClaimsPrincipal(new ClaimsIdentity(new List<Claim>() { new Claim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", userId) })));
            controller.ControllerContext.HttpContext = contextMock.Object;
        }
    }
}
